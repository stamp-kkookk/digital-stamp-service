#!/bin/bash
set -euo pipefail

# =============================================================================
# Gateway / Bastion / NAT Instance — User Data Script
# Roles: nginx reverse proxy, SSH bastion, NAT instance, fail2ban
# =============================================================================

exec > >(tee /var/log/user-data.log) 2>&1
echo "=== Gateway user-data start: $(date) ==="

# --- System update ---
apt-get update -y
apt-get upgrade -y

# --- Install packages ---
apt-get install -y nginx fail2ban

# --- NAT Instance: Enable IP forwarding + iptables MASQUERADE ---
echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf
sysctl -p

# iptables NAT rule: masquerade private subnet traffic
iptables -t nat -A POSTROUTING -o ens5 -s 10.0.0.0/16 -j MASQUERADE

# Persist iptables across reboots (pre-answer interactive prompts)
echo iptables-persistent iptables-persistent/autosave_v4 boolean true | debconf-set-selections
echo iptables-persistent iptables-persistent/autosave_v6 boolean true | debconf-set-selections
DEBIAN_FRONTEND=noninteractive apt-get install -y iptables-persistent
netfilter-persistent save

# --- nginx: Reverse proxy to Backend EC2 ---
cat > /etc/nginx/sites-available/gateway <<'NGINX'
server {
    listen 80;
    server_name _;

    # Health check for CloudFront
    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }

    # API proxy → Backend EC2 (private subnet)
    location /api/ {
        proxy_pass http://BACKEND_PRIVATE_IP:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
        proxy_send_timeout 30s;

        # Disable buffering for SSE/streaming
        proxy_buffering off;
    }

    # OAuth callbacks now live under /api/public/oauth2/* (covered by /api/ above).
    # /oauth/complete is a frontend SPA route served by CloudFront → S3.
}
NGINX

# The BACKEND_PRIVATE_IP placeholder will be replaced after backend EC2 is created.
# For now, leave it as a placeholder. Update via SSM or manually after terraform apply.

ln -sf /etc/nginx/sites-available/gateway /etc/nginx/sites-enabled/gateway
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl restart nginx
systemctl enable nginx

# --- fail2ban: Protect SSH ---
cat > /etc/fail2ban/jail.local <<'F2B'
[sshd]
enabled = true
port = 22
maxretry = 5
bantime = 3600
findtime = 600
F2B

systemctl restart fail2ban
systemctl enable fail2ban

# --- SSH hardening ---
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

echo "=== Gateway user-data complete: $(date) ==="
