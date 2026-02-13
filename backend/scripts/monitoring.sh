#!/bin/bash
# =============================================
# KKOOKK 모니터링 스택 관리 스크립트 (Ubuntu)
#
# 사용법:
#   bash scripts/monitoring.sh start   # 시작
#   bash scripts/monitoring.sh stop    # 중지
#   bash scripts/monitoring.sh restart # 재시작
#   bash scripts/monitoring.sh status  # 상태 확인
#   bash scripts/monitoring.sh clean   # 중지 + 데이터 삭제
# =============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.monitoring.yml"

case "${1:-help}" in
    start)
        echo "[Monitoring] Starting..."
        docker compose -f "$COMPOSE_FILE" up -d
        echo ""
        echo "  Grafana:      http://localhost:3000 (admin/admin)"
        echo "  Prometheus:   http://localhost:9090"
        echo "  Loki:         http://localhost:3100"
        echo "  Alertmanager: http://localhost:9093"
        ;;
    stop)
        echo "[Monitoring] Stopping..."
        docker compose -f "$COMPOSE_FILE" down
        ;;
    restart)
        echo "[Monitoring] Restarting..."
        docker compose -f "$COMPOSE_FILE" down
        docker compose -f "$COMPOSE_FILE" up -d
        ;;
    status)
        docker compose -f "$COMPOSE_FILE" ps
        ;;
    clean)
        echo "[Monitoring] Stopping and removing data..."
        docker compose -f "$COMPOSE_FILE" down -v
        echo "  All monitoring data deleted."
        ;;
    *)
        echo "Usage: bash scripts/monitoring.sh {start|stop|restart|status|clean}"
        exit 1
        ;;
esac
