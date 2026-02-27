#!/bin/bash
set -euo pipefail

ENV_FILE="/opt/kkookk/.env"

cp /opt/kkookk/.env.template "$ENV_FILE"

# RDS endpoint
sed -i 's|DB_URL=.*|DB_URL=jdbc:mysql://kkookk-db.cb06qgyw8pno.ap-northeast-2.rds.amazonaws.com:3306/kkookkdb?useSSL=true\&serverTimezone=Asia/Seoul\&characterEncoding=UTF-8|' "$ENV_FILE"

# DB password (from SSM Parameter Store)
DB_PASSWORD=$(aws ssm get-parameter \
  --name "kkookk.prod.db.password" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text)
sed -i "s/DB_PASSWORD=CHANGE_ME/DB_PASSWORD=$DB_PASSWORD/" "$ENV_FILE"

# QR base URL (CloudFront domain)
sed -i 's|QR_BASE_URL=.*|QR_BASE_URL=https://stamp-kkookk.com|' "$ENV_FILE"

# JWT Secret (generate random)
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s/JWT_SECRET=CHANGE_ME_256BIT_SECRET/JWT_SECRET=$JWT_SECRET/" "$ENV_FILE"

echo "--- .env configured ---"
grep -E '^(SPRING_PROFILES|DB_URL|DB_PASSWORD|DB_USERNAME|QR_BASE_URL|JWT_SECRET|LOKI_URL|STORAGE_PATH)' "$ENV_FILE"
echo "ENV_SETUP_DONE"
