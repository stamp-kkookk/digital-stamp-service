#!/bin/bash
echo "=== NGINX STATUS ==="
systemctl status nginx --no-pager || echo "NGINX NOT RUNNING"
echo "=== NGINX CONFIG ==="
cat /etc/nginx/sites-enabled/backend
echo "=== LISTENING PORTS ==="
ss -tlnp
echo "=== DOCKER PS ==="
docker ps -a
echo "=== LOCAL CURL nginx:80 ==="
curl -sf --max-time 3 http://127.0.0.1:80/api/public/health || echo "FAIL_NGINX_80"
echo "=== LOCAL CURL docker:8082 ==="
curl -sf --max-time 3 http://127.0.0.1:8082/api/public/health || echo "FAIL_DOCKER_8082"
echo "=== LOCAL CURL actuator:7072 ==="
curl -sf --max-time 3 http://127.0.0.1:7072/actuator/health || echo "FAIL_ACTUATOR_7072"
