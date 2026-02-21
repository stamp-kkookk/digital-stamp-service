#!/bin/bash
# =============================================
# KKOOKK Backend 배포 스크립트 (Ubuntu)
#
# 사용법:
#   1. .env 파일 생성:  cp scripts/.env.example scripts/.env
#   2. .env 파일에 실제 값 입력
#   3. 실행:  bash scripts/deploy.sh
# =============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$SCRIPT_DIR/.env"

# --- .env 파일 로드 ---
if [ ! -f "$ENV_FILE" ]; then
    echo "[ERROR] .env 파일이 없습니다."
    echo "  cp scripts/.env.example scripts/.env 후 값을 입력하세요."
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

echo "=========================================="
echo " KKOOKK Backend Deploy"
echo "=========================================="
echo " Profile:  $SPRING_PROFILES_ACTIVE"
echo " DB URL:   $DB_URL"
echo " Metrics:  http://localhost:7070/actuator/prometheus"
echo " Loki:     ${LOKI_URL:-http://localhost:3100}"
echo "=========================================="

# --- 빌드 ---
echo "[1/3] Building..."
cd "$PROJECT_DIR"
./gradlew clean build -x test --no-daemon -q

# --- 기존 프로세스 종료 ---
echo "[2/3] Stopping existing process..."
PID=$(pgrep -f "kkookk.*\.jar" || true)
if [ -n "$PID" ]; then
    kill "$PID"
    sleep 3
    echo "  Stopped PID $PID"
else
    echo "  No existing process"
fi

# --- 실행 ---
echo "[3/3] Starting application..."
JAR_FILE=$(ls -t "$PROJECT_DIR/build/libs/"*.jar 2>/dev/null | grep -v plain | head -1)

if [ -z "$JAR_FILE" ]; then
    echo "[ERROR] JAR 파일을 찾을 수 없습니다."
    exit 1
fi

nohup java -jar "$JAR_FILE" \
    --spring.profiles.active="$SPRING_PROFILES_ACTIVE" \
    > "$PROJECT_DIR/logs/app.log" 2>&1 &

NEW_PID=$!
echo "=========================================="
echo " Started (PID: $NEW_PID)"
echo " Log: tail -f $PROJECT_DIR/logs/app.log"
echo "=========================================="
