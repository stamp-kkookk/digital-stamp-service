#!/bin/bash
set -euo pipefail

echo "=== Setting up Monitoring Stack ==="

S3_BUCKET="kkookk-artifacts-471112770205"
REGION="ap-northeast-2"

# Create directory structure
mkdir -p /opt/monitoring/{prometheus,loki,alertmanager}
mkdir -p /opt/monitoring/grafana/provisioning/{dashboards,datasources,alerting}
mkdir -p /opt/monitoring/grafana/dashboards

# Download all config files from S3
echo "Downloading configs from S3..."
aws s3 cp "s3://$S3_BUCKET/monitoring/" /opt/monitoring/ --recursive --region "$REGION"

# Fix CRLF line endings
find /opt/monitoring -type f \( -name "*.yml" -o -name "*.yaml" -o -name "*.json" -o -name "*.template" \) -exec sed -i 's/\r$//' {} +

# Set permissions
chown -R 65534:65534 /opt/monitoring/prometheus  # nobody user for prometheus
chown -R 472:472 /opt/monitoring/grafana          # grafana user
chown -R 65534:65534 /opt/monitoring/loki          # nobody user for loki

echo "Config files downloaded:"
find /opt/monitoring -type f | sort

# Start monitoring stack
echo "=== Starting Docker Compose ==="
cd /opt/monitoring
docker compose up -d

echo "=== Waiting for containers to start ==="
sleep 15

echo "=== Container Status ==="
docker ps -a

echo "=== Health Checks ==="
curl -sf --max-time 5 http://127.0.0.1:9090/-/healthy && echo " - Prometheus: OK" || echo " - Prometheus: FAIL"
curl -sf --max-time 5 http://127.0.0.1:3000/api/health && echo " - Grafana: OK" || echo " - Grafana: FAIL"
curl -sf --max-time 5 http://127.0.0.1:3100/ready && echo " - Loki: OK" || echo " - Loki: FAIL"
curl -sf --max-time 5 http://127.0.0.1:9093/-/healthy && echo " - AlertManager: OK" || echo " - AlertManager: FAIL"

echo "=== Monitoring setup complete ==="
