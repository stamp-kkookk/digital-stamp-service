#!/bin/bash
set -euo pipefail

# =============================================================================
# Backend Deploy Script — Called by SSM from GitHub Actions
# Usage: deploy-backend.sh <s3-jar-key>
# =============================================================================

JAR_KEY="${1:?Usage: deploy-backend.sh <s3-jar-key>}"

echo "=== SSM Deploy triggered: $(date) ==="
echo "JAR key: $JAR_KEY"

# Delegate to the main deploy script
/opt/kkookk/deploy.sh "$JAR_KEY"
