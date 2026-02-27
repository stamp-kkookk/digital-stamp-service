#!/bin/bash
set -euo pipefail

# Patch deploy.sh to also switch metrics upstream on nginx
# Step 6 (nginx switch) needs to update both app and metrics ports

cat > /opt/kkookk/deploy.sh <<'DEPLOY'
#!/bin/bash
set -euo pipefail

# =============================================================================
# Blue/Green Docker Deploy Script
# Usage: /opt/kkookk/deploy.sh [jar-s3-key]
# =============================================================================

DEPLOY_DIR="/opt/kkookk"
ENV_FILE="$DEPLOY_DIR/.env"
DOCKERFILE="$DEPLOY_DIR/Dockerfile"
HEALTH_URL="http://127.0.0.1"
HEALTH_TIMEOUT=120
S3_BUCKET="S3_BUCKET_PLACEHOLDER"

# Determine which slot is active
BLUE_PORT=8081
GREEN_PORT=8082
BLUE_METRICS=7071
GREEN_METRICS=7072

get_active_port() {
    grep -oP 'upstream backend \{\s*server 127\.0\.0\.1:\K\d+' /etc/nginx/sites-available/backend 2>/dev/null || echo "$BLUE_PORT"
}

ACTIVE_PORT=$(get_active_port)

if [ "$ACTIVE_PORT" = "$BLUE_PORT" ]; then
    DEPLOY_NAME="green"
    DEPLOY_PORT=$GREEN_PORT
    DEPLOY_METRICS=$GREEN_METRICS
    OLD_NAME="blue"
else
    DEPLOY_NAME="blue"
    DEPLOY_PORT=$BLUE_PORT
    DEPLOY_METRICS=$BLUE_METRICS
    OLD_NAME="green"
fi

echo "=== Deploying to $DEPLOY_NAME (port $DEPLOY_PORT, metrics $DEPLOY_METRICS) ==="

# 1. Download JAR from S3
JAR_KEY="${1:-backend/kkookk-latest.jar}"
echo "Downloading s3://$S3_BUCKET/$JAR_KEY ..."
aws s3 cp "s3://$S3_BUCKET/$JAR_KEY" "$DEPLOY_DIR/app.jar"

# 2. Build Docker image
echo "Building Docker image..."
docker build -t "kkookk-backend:$DEPLOY_NAME" "$DEPLOY_DIR"

# 3. Stop existing container on target port (if any)
if docker ps -a --format '{{.Names}}' | grep -q "kkookk-$DEPLOY_NAME"; then
    echo "Removing existing $DEPLOY_NAME container..."
    docker rm -f "kkookk-$DEPLOY_NAME" 2>/dev/null || true
fi

# 4. Start new container
echo "Starting kkookk-$DEPLOY_NAME on port $DEPLOY_PORT..."
docker run -d \
    --name "kkookk-$DEPLOY_NAME" \
    --env-file "$ENV_FILE" \
    -p "$DEPLOY_PORT:8080" \
    -p "$DEPLOY_METRICS:7070" \
    -v /data/storage:/data/storage \
    --restart unless-stopped \
    "kkookk-backend:$DEPLOY_NAME"

# 5. Health check (check actuator on metrics port)
echo "Waiting for health check on port $DEPLOY_METRICS (actuator)..."
ELAPSED=0
while [ $ELAPSED -lt $HEALTH_TIMEOUT ]; do
    if curl -sf "$HEALTH_URL:$DEPLOY_METRICS/actuator/health" > /dev/null 2>&1; then
        echo "Health check passed after ${ELAPSED}s"
        break
    fi
    sleep 3
    ELAPSED=$((ELAPSED + 3))
done

if [ $ELAPSED -ge $HEALTH_TIMEOUT ]; then
    echo "ERROR: Health check failed after ${HEALTH_TIMEOUT}s. Rolling back."
    docker logs "kkookk-$DEPLOY_NAME" --tail 50
    docker rm -f "kkookk-$DEPLOY_NAME"
    exit 1
fi

# 6. Switch nginx upstream (both app and metrics)
echo "Switching nginx to $DEPLOY_NAME (port $DEPLOY_PORT, metrics $DEPLOY_METRICS)..."
cat > /etc/nginx/sites-available/backend <<NGINX
upstream backend {
    server 127.0.0.1:$DEPLOY_PORT;
}

upstream backend_metrics {
    server 127.0.0.1:$DEPLOY_METRICS;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
        proxy_send_timeout 30s;
    }
}

server {
    listen 7070;
    server_name _;

    location / {
        proxy_pass http://backend_metrics;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINX

nginx -t && nginx -s reload

# 7. Graceful stop of old container
if docker ps --format '{{.Names}}' | grep -q "kkookk-$OLD_NAME"; then
    echo "Stopping old container kkookk-$OLD_NAME..."
    docker stop "kkookk-$OLD_NAME" --time 30
    echo "Old container stopped (kept for rollback: docker start kkookk-$OLD_NAME)"
fi

# 8. Cleanup old images (keep last 2)
echo "Cleaning up old images..."
docker image prune -f

echo "=== Deploy complete: $DEPLOY_NAME is now active on port $DEPLOY_PORT ==="
DEPLOY

# Replace S3 bucket placeholder
ACTUAL_BUCKET=$(grep S3_BUCKET /opt/kkookk/deploy.sh.bak 2>/dev/null | grep -oP 'S3_BUCKET="\K[^"]+' || echo "kkookk-artifacts-471112770205")
sed -i "s|S3_BUCKET_PLACEHOLDER|kkookk-artifacts-471112770205|" /opt/kkookk/deploy.sh
chmod +x /opt/kkookk/deploy.sh

echo "deploy.sh updated with metrics upstream switching"
