#!/bin/bash
set -euo pipefail

BACKEND_IP="10.0.10.106"

cat > /etc/nginx/sites-available/gateway <<NGINX
server {
    listen 80;
    server_name _;

    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }

    location /api/ {
        proxy_pass http://${BACKEND_IP}:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
        proxy_send_timeout 30s;
        proxy_buffering off;
    }

    location /oauth/ {
        proxy_pass http://${BACKEND_IP}:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/gateway /etc/nginx/sites-enabled/gateway
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo "GATEWAY_NGINX_CONFIGURED"
