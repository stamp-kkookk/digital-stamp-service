#!/bin/bash
set -euo pipefail

# Patch deploy.sh: fix health check to use DEPLOY_METRICS port instead of DEPLOY_PORT
sed -i 's|\$HEALTH_URL:\$DEPLOY_PORT/actuator/health|\$HEALTH_URL:\$DEPLOY_METRICS/actuator/health|' /opt/kkookk/deploy.sh

# Fix HEALTH_TIMEOUT
sed -i 's/HEALTH_TIMEOUT=90/HEALTH_TIMEOUT=120/' /opt/kkookk/deploy.sh
sed -i 's/HEALTH_TIMEOUT=180/HEALTH_TIMEOUT=120/' /opt/kkookk/deploy.sh

echo "=== Patched deploy.sh ==="
grep -n 'actuator' /opt/kkookk/deploy.sh
grep -n 'HEALTH_TIMEOUT' /opt/kkookk/deploy.sh
