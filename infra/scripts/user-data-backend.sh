#!/bin/bash
set -euo pipefail

# =============================================================================
# Backend EC2 — User Data Script (templatefile variables from Terraform)
# Roles: Docker host, nginx blue/green switch, deploy script
# =============================================================================

exec > >(tee /var/log/user-data.log) 2>&1
echo "=== Backend user-data start: $(date) ==="

S3_ARTIFACTS_BUCKET="${s3_artifacts_bucket}"
MONITORING_IP="${monitoring_ip}"

# --- System update ---
apt-get update -y
apt-get upgrade -y

# --- Install Docker (official) ---
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io
usermod -aG docker ubuntu
systemctl enable docker

# --- Install nginx ---
apt-get install -y nginx

# --- Install AWS CLI v2 (ARM) ---
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o /tmp/awscliv2.zip
apt-get install -y unzip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/aws /tmp/awscliv2.zip

# --- Create app directories ---
mkdir -p /opt/kkookk
mkdir -p /data/storage

# --- Create .env template ---
cat > /opt/kkookk/.env.template <<'ENV'
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://RDS_ENDPOINT:3306/kkookkdb?useSSL=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=kkookkuser
DB_PASSWORD=CHANGE_ME
JWT_SECRET=CHANGE_ME_256BIT_SECRET
JWT_ACCESS_TOKEN_EXPIRATION=3600000
JWT_REFRESH_TOKEN_EXPIRATION=604800000
JWT_STEPUP_TOKEN_EXPIRATION=600000
QR_BASE_URL=https://CLOUDFRONT_DOMAIN
STORAGE_PATH=/data/storage
LOKI_URL=http://MONITORING_IP:3100
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
FRONTEND_URL=https://CLOUDFRONT_DOMAIN
SLACK_WEBHOOK_CRITICAL=
SLACK_WEBHOOK_WARNING=
ENV

# Set monitoring IP in template
sed -i "s/MONITORING_IP/$MONITORING_IP/" /opt/kkookk/.env.template

# --- nginx: Blue/Green switching (app + metrics proxy) ---
cat > /etc/nginx/sites-available/backend <<'NGINX'
upstream backend {
    # Active container port (blue=8081, green=8082)
    server 127.0.0.1:8081;
}

upstream backend_metrics {
    # Active metrics port (blue=7071, green=7072)
    server 127.0.0.1:7071;
}

server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/backend
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx
systemctl enable nginx

# --- Dockerfile for backend app ---
cat > /opt/kkookk/Dockerfile <<'DOCKERFILE'
FROM amazoncorretto:17-alpine
WORKDIR /app
COPY app.jar app.jar
ENV JAVA_OPTS="-Xmx384m -Xms256m"
EXPOSE 8080 7070
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
DOCKERFILE

# --- Deploy script ---
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
S3_BUCKET="S3_ARTIFACTS_BUCKET_PLACEHOLDER"

# Determine which slot is active
BLUE_PORT=8081
GREEN_PORT=8082
BLUE_METRICS=7071
GREEN_METRICS=7072

get_active_port() {
    grep -A1 'upstream backend {' /etc/nginx/sites-available/backend 2>/dev/null | grep -oP '127\.0\.0\.1:\K\d+' || echo "$BLUE_PORT"
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

echo "=== Deploying to $DEPLOY_NAME (port $DEPLOY_PORT) ==="

# 1. Download JAR from S3
JAR_KEY="$${1:-backend/kkookk-latest.jar}"
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

# 5. Health check (wait for Spring Boot to start)
echo "Waiting for health check on port $DEPLOY_METRICS (actuator)..."
ELAPSED=0
while [ $ELAPSED -lt $HEALTH_TIMEOUT ]; do
    if curl -sf "$HEALTH_URL:$DEPLOY_METRICS/actuator/health" > /dev/null 2>&1; then
        echo "Health check passed after $${ELAPSED}s"
        break
    fi
    sleep 3
    ELAPSED=$((ELAPSED + 3))
done

if [ $ELAPSED -ge $HEALTH_TIMEOUT ]; then
    echo "ERROR: Health check failed after $${HEALTH_TIMEOUT}s. Rolling back."
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

sed -i "s|S3_ARTIFACTS_BUCKET_PLACEHOLDER|$S3_ARTIFACTS_BUCKET|" /opt/kkookk/deploy.sh
chmod +x /opt/kkookk/deploy.sh

# --- Rollback script ---
cat > /opt/kkookk/rollback.sh <<'ROLLBACK'
#!/bin/bash
set -euo pipefail

# Quick rollback: switch back to the stopped container

BLUE_PORT=8081
GREEN_PORT=8082

get_active_port() {
    grep -A1 'upstream backend {' /etc/nginx/sites-available/backend 2>/dev/null | grep -oP '127\.0\.0\.1:\K\d+' || echo "$BLUE_PORT"
}

ACTIVE_PORT=$(get_active_port)

BLUE_METRICS=7071
GREEN_METRICS=7072

if [ "$ACTIVE_PORT" = "$BLUE_PORT" ]; then
    ROLLBACK_NAME="green"
    ROLLBACK_PORT=$GREEN_PORT
    ROLLBACK_METRICS=$GREEN_METRICS
else
    ROLLBACK_NAME="blue"
    ROLLBACK_PORT=$BLUE_PORT
    ROLLBACK_METRICS=$BLUE_METRICS
fi

echo "Rolling back to kkookk-$ROLLBACK_NAME (port $ROLLBACK_PORT)..."

# Start old container
if ! docker start "kkookk-$ROLLBACK_NAME"; then
    echo "ERROR: No old container to rollback to"
    exit 1
fi

# Wait for health (check actuator on metrics port)
sleep 10
if ! curl -sf "http://127.0.0.1:$ROLLBACK_METRICS/actuator/health" > /dev/null 2>&1; then
    echo "WARNING: Rollback container not healthy yet, waiting..."
    sleep 20
fi

# Switch nginx
sed -i "s/server 127.0.0.1:[0-9]*/server 127.0.0.1:$ROLLBACK_PORT/" /etc/nginx/sites-available/backend
nginx -t && nginx -s reload

echo "=== Rollback complete: $ROLLBACK_NAME is now active ==="
ROLLBACK

chmod +x /opt/kkookk/rollback.sh

echo "=== Backend user-data complete: $(date) ==="
