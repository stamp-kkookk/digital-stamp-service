# KKOOKK 모니터링 스택 로컬 온보딩 가이드

## 사전 요구사항

- Docker Desktop 실행 중
- Java 17+
- MySQL 8.0 (로컬 또는 Docker)

---

## 1. 모니터링 스택 실행

```bash
cd backend
docker compose -f docker-compose.monitoring.yml up -d
```

4개 컨테이너가 뜹니다:

| 서비스 | 포트 | 확인 URL |
|--------|------|----------|
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3000 | http://localhost:3000 |
| Loki | 3100 | http://localhost:3100/ready |
| Alertmanager | 9093 | http://localhost:9093 |

정상 확인:
```bash
docker compose -f docker-compose.monitoring.yml ps
```
4개 모두 `running` 상태여야 합니다.

---

## 2. Spring Boot 앱 실행

MySQL이 실행 중인 상태에서:
```bash
cd backend
./gradlew bootRun
```

앱이 뜨면 두 개 포트가 열립니다:
- **8080** — API 요청
- **7070** — Actuator 메트릭/헬스

---

## 3. 기본 동작 확인

### 3-1. Actuator 엔드포인트

```bash
# 헬스 체크
curl http://localhost:7070/actuator/health

# Prometheus 메트릭 (텍스트가 쏟아지면 정상)
curl http://localhost:7070/actuator/prometheus
```

### 3-2. Prometheus → 앱 연결 확인

1. http://localhost:9090 접속
2. 상단 메뉴 **Status → Targets**
3. `kkookk-backend` 상태가 **UP** (초록) 이면 정상
4. **DOWN** (빨강) 이면 앱이 안 뜬 것 → `./gradlew bootRun` 확인

### 3-3. Grafana 대시보드 확인

1. http://localhost:3000 접속
2. 로그인: `admin` / `admin` (비밀번호 변경은 Skip)
3. 좌측 메뉴 → **Dashboards** → **KKOOKK** 폴더
4. 4개 대시보드가 보이면 정상:
   - Application Overview
   - Business Metrics
   - Infrastructure
   - SLO Tracking

---

## 4. 메트릭 데이터 만들기

대시보드에 데이터가 보이려면 API 요청이 필요합니다.

### Swagger에서 API 호출
1. http://localhost:8080/swagger-ui/index.html 접속
2. 아무 API 몇 개 호출 (예: 로그인, 매장 조회 등)

### curl로 간단 호출
```bash
# 200 응답 (정상 요청)
curl http://localhost:8080/api/public/stores

# 401 응답 (인증 없이 호출)
curl http://localhost:8080/api/owner/stores

# 404 응답 (없는 경로)
curl http://localhost:8080/api/nonexistent
```

### 반복 호출로 그래프에 데이터 쌓기
```bash
# 30초 동안 1초 간격으로 반복 호출
for i in $(seq 1 30); do
  curl -s http://localhost:8080/api/public/stores > /dev/null
  sleep 1
done
```

PowerShell:
```powershell
1..30 | ForEach-Object {
  Invoke-RestMethod -Uri "http://localhost:8080/api/public/stores" -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
}
```

---

## 5. 대시보드별 확인 포인트

### Application Overview
- **상단 6개 지표**: Uptime, Request Rate, Error Rate, P99, CPU, Heap
- **Request Rate 그래프**: API 호출하면 선이 올라가는지 확인
- **Log Events by Level**: INFO 바가 쌓이는지 확인
- **Recent ERROR/WARN Logs**: Loki에서 로그를 가져오는지 확인

### Infrastructure
- **JVM Heap Memory**: 메모리 사용량 그래프
- **HikariCP Connections**: Active/Idle 커넥션 표시
- **Caffeine Cache**: 캐시가 설정된 경우 히트율 표시

### Business Metrics
- 실제 적립/리딤 API를 호출해야 데이터가 보임
- **하단 로그 패널**: `[Issuance]`, `[Redeem]` 등 도메인 로그 표시

### SLO Tracking
- 충분한 요청이 쌓여야 의미 있는 수치 표시
- **Error Budget Burn Rate**: 5xx가 없으면 0으로 표시 (정상)

---

## 6. Loki 로그 확인

Grafana에서 직접 로그를 검색할 수 있습니다.

1. Grafana 좌측 메뉴 → **Explore**
2. 상단 데이터소스를 **Loki** 선택
3. 쿼리 입력:

```
# 전체 로그
{application="kkookk"}

# ERROR 로그만
{application="kkookk",level="ERROR"}

# 특정 도메인 로그
{application="kkookk"} |= "[Issuance]"
{application="kkookk"} |= "[Auth]"
{application="kkookk"} |= "[Redeem]"

# 특정 correlationId로 요청 추적
{application="kkookk"} |= "abc123"

# HTTP 요청 로그만
{application="kkookk"} |= "[HTTP]"
```

> Loki에 로그가 안 보이면: 앱이 `local` 프로파일로 뜬 상태에서 Loki(localhost:3100)가 실행 중이어야 합니다. `logback-spring.xml`에서 local 프로파일에도 Loki appender가 활성화되어 있습니다.

---

## 7. Prometheus 쿼리 직접 실행

http://localhost:9090 에서 PromQL을 직접 실행할 수 있습니다.

```promql
# 초당 요청 수
sum(rate(http_server_requests_seconds_count{application="kkookk"}[1m]))

# P99 응답시간
histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket{application="kkookk"}[5m])) by (le))

# 5xx 에러율
sum(rate(http_server_requests_seconds_count{application="kkookk",status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count{application="kkookk"}[5m]))

# JVM 힙 사용률
sum(jvm_memory_used_bytes{application="kkookk",area="heap"}) / sum(jvm_memory_max_bytes{application="kkookk",area="heap"})

# HikariCP 활성 커넥션
hikaricp_connections_active{application="kkookk"}

# 로그 레벨별 발생 수
sum by (level) (rate(logback_events_total{application="kkookk"}[1m]))
```

---

## 8. 알림 테스트 (선택)

### 알림 채널 구조

알림은 심각도 기반으로 2채널로 분리됩니다:

| 채널 | 발송 주체 | 대상 알림 |
|------|----------|----------|
| **#alert-critical** | Alertmanager + Grafana | HighErrorRate_5xx, JvmMemoryCritical, HikariPendingConnections, ErrorLogSpike, UnhandledException, DBConnectionError |
| **#alert-warning** | Alertmanager + Grafana | HighErrorRate_4xx, PollingLatencyHigh, ApprovalLatencyHigh, JvmMemoryHigh, HikariPoolExhaustion, IssuanceExpireRateHigh, AuthFailureSpike, IssuanceExpiredSpike, RedeemExpiredSpike |

- Alertmanager: 메트릭 기반 알림 (10개) — "무엇이 이상한가"
- Grafana Loki Alerting: 로그 기반 알림 (6개) — "왜 이상한가"

### 8-1. Slack Webhook 발급 (채널당 1개씩)

1. https://api.slack.com/apps → Create New App → From scratch
2. Incoming Webhooks → Activate On
3. **#alert-critical** 채널 → Add New Webhook → URL 복사
4. **#alert-warning** 채널 → Add New Webhook → URL 복사

### 8-2. .env 파일 생성

```bash
cd backend
cat > .env << 'EOF'
SLACK_WEBHOOK_CRITICAL=https://hooks.slack.com/services/YOUR/CRITICAL/WEBHOOK
SLACK_WEBHOOK_WARNING=https://hooks.slack.com/services/YOUR/WARNING/WEBHOOK
EOF
```

PowerShell:
```powershell
cd backend
@"
SLACK_WEBHOOK_CRITICAL=https://hooks.slack.com/services/YOUR/CRITICAL/WEBHOOK
SLACK_WEBHOOK_WARNING=https://hooks.slack.com/services/YOUR/WARNING/WEBHOOK
"@ | Set-Content .env -Encoding UTF8
```

### 8-3. 모니터링 스택 재시작

```bash
docker compose -f docker-compose.monitoring.yml down
docker compose -f docker-compose.monitoring.yml up -d
```

### 8-4. 테스트 알림 전송

critical 알림 테스트 (→ #alert-critical):
```bash
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"TestAlert","severity":"critical"},"annotations":{"summary":"Critical test alert","description":"Testing #alert-critical channel"}}]'
```

warning 알림 테스트 (→ #alert-warning):
```bash
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"TestAlert","severity":"warning"},"annotations":{"summary":"Warning test alert","description":"Testing #alert-warning channel"}}]'
```

각 채널에 `[CRITICAL]` / `[WARNING]` 메시지가 오면 성공.

---

## 9. 종료

```bash
# 모니터링 스택만 종료
docker compose -f docker-compose.monitoring.yml down

# 데이터도 삭제 (초기화)
docker compose -f docker-compose.monitoring.yml down -v
```

---

## 트러블슈팅

### Prometheus Target이 DOWN
- 앱이 실행 중인지 확인: `curl http://localhost:7070/actuator/health`
- Docker Desktop에서 `host.docker.internal` 지원 확인 (Settings → General → WSL 관련 설정)

### Grafana 대시보드가 비어있음
- 앱에 API 요청을 보내야 데이터가 쌓임 (위의 "메트릭 데이터 만들기" 참고)
- Prometheus Target이 UP인지 확인
- 대시보드 시간 범위가 `Last 1 hour`인지 확인 (우측 상단)

### Loki에 로그가 안 보임
- Loki 컨테이너 실행 확인: `curl http://localhost:3100/ready` → `ready`
- 앱이 실행 중이고 API 요청을 보낸 후 확인
- Grafana Explore → Loki → `{application="kkookk"}` 쿼리

### Alertmanager에 Slack 알림이 안 감
- `.env` 파일에 `SLACK_WEBHOOK_CRITICAL`과 `SLACK_WEBHOOK_WARNING`이 정확한지 확인
- 모니터링 스택을 `.env` 생성 후 재시작했는지 확인 (`down` → `up -d`)
- `curl http://localhost:9093/api/v2/status` 로 Alertmanager 상태 확인

### 포트 충돌
- 3000 (Grafana), 3100 (Loki), 9090 (Prometheus), 9093 (Alertmanager)
- 다른 서비스가 이 포트를 사용 중이면 `docker-compose.monitoring.yml`에서 포트 변경

---

## 아키텍처 요약

```
                         ┌─────────────────┐
 사용자 → API :8080 → │  Spring Boot     │
                         │                 │
                         │  Actuator :7070 │──── pull (15s) ──→ Prometheus :9090
                         │                 │                         │
                         │  Logback+loki4j │──── push ──────→ Loki :3100
                         └─────────────────┘                         │
                                                                     ↓
                   #alert-critical ←─┐
                                    ├── Alertmanager :9093 ←── 메트릭 알림 10개
                   #alert-warning ←─┘         │
                                              │
                   #alert-critical ←─┐        │
                                    ├── Grafana :3000 ←──── 로그 알림 6개
                   #alert-warning ←─┘  (메트릭 + 로그 대시보드)
```
