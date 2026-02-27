#!/bin/bash
set -euo pipefail

echo "=== Adding metrics proxy to Backend nginx ==="

# Get current active metrics port from docker
ACTIVE_CONTAINER=$(docker ps --format '{{.Names}}' | grep kkookk | head -1)
if [ "$ACTIVE_CONTAINER" = "kkookk-green" ]; then
    METRICS_PORT=7072
else
    METRICS_PORT=7071
fi
echo "Active container: $ACTIVE_CONTAINER, Metrics port: $METRICS_PORT"

# Write new nginx config with metrics server block
cat > /etc/nginx/sites-available/backend <<NGINX
upstream backend {
    # Active container port (blue=8081, green=8082)
    server 127.0.0.1:$(grep -oP 'server 127\.0\.0\.1:\K\d+' /etc/nginx/sites-available/backend || echo 8082);
}

upstream backend_metrics {
    # Active metrics port (blue=7071, green=7072)
    server 127.0.0.1:$METRICS_PORT;
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
echo "=== Nginx reloaded with metrics proxy on port 7070 ==="

# Verify
curl -sf --max-time 3 http://127.0.0.1:7070/actuator/health && echo " - Metrics proxy: OK" || echo " - Metrics proxy: FAIL"
