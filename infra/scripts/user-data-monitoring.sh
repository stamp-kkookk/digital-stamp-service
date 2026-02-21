#!/bin/bash
set -euo pipefail

# =============================================================================
# Monitoring EC2 — User Data Script
# Roles: Docker host for Prometheus, Grafana, Loki, AlertManager
# =============================================================================

exec > >(tee /var/log/user-data.log) 2>&1
echo "=== Monitoring user-data start: $(date) ==="

# --- System update ---
apt-get update -y
apt-get upgrade -y

# --- Swap file (1GB for safety margin on t4g.micro) ---
fallocate -l 1G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# --- Install Docker + Docker Compose ---
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
usermod -aG docker ubuntu
systemctl enable docker

# --- Create monitoring directories ---
mkdir -p /opt/monitoring
mkdir -p /opt/monitoring/prometheus
mkdir -p /opt/monitoring/grafana/provisioning/datasources
mkdir -p /opt/monitoring/grafana/provisioning/dashboards
mkdir -p /opt/monitoring/grafana/provisioning/alerting
mkdir -p /opt/monitoring/grafana/dashboards
mkdir -p /opt/monitoring/loki
mkdir -p /opt/monitoring/alertmanager

# Note: Monitoring configuration files (prometheus.yml, grafana dashboards, etc.)
# will be copied from the project's backend/docker/monitoring/ directory.
# After terraform apply, SCP the configs:
#
#   scp -r backend/docker/monitoring/* kkookk-monitoring:/opt/monitoring/
#   scp backend/docker-compose.monitoring.yml kkookk-monitoring:/opt/monitoring/docker-compose.yml
#
# Then update docker-compose.yml volume paths to /opt/monitoring/...
# and start:
#   ssh kkookk-monitoring "cd /opt/monitoring && docker compose up -d"

# --- SSH hardening ---
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

echo "=== Monitoring user-data complete: $(date) ==="
