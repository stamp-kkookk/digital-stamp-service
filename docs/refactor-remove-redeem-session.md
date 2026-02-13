# refactor: RedeemSession 제거 및 리딤 플로우 단일 API로 단순화

## 배경

현재 리딤(리워드 사용) 플로우는 2-step 세션 방식으로 구현되어 있다:

1. `POST /api/customer/redeem-sessions` — 세션 생성 (PENDING, TTL 60초)
2. `POST /api/customer/redeem-sessions/{id}/complete` — 세션 완료

그러나 실제 운영에서는 **사장님/직원이 고객 폰의 버튼을 직접 누르는 구조**이기 때문에:

- 60초 TTL은 세션 자체가 만든 중간 상태(REDEEMING)를 수습하기 위한 장치일 뿐, 실질적 보호 역할을 하지 않음
- 터미널에서 pending 리딤 세션을 폴링할 필요가 없음 (사장님이 이미 고객 폰을 보고 있음)
- 단일 API 호출로도 PRD가 요구하는 **OTP StepUp + 2차 확인 모달 + 멱등성**을 모두 충족 가능

---

## 변경 요약

| 구분     | 삭제    | 수정    | 생성   |
| -------- | ------- | ------- | ------ | --- |
| Backend  | 11 파일 | 12 파일 | 2 파일 | `   |
| Frontend | 1 파일  | 7 파일  | 0      |
| Docs     | 0       | 4 파일  | 0      |

---

## 변경 사항

### 제거

- `RedeemSession` 엔티티 및 `redeem_session` 테이블
- `WalletRewardStatus.REDEEMING` 중간 상태
- 터미널 리딤 세션 폴링 (컨트롤러, 서비스, API)
- 프론트엔드 TTL 카운트다운

### 변경

- 2개 API (`create` + `complete`) → `POST /api/customer/redeems` 단일 API
- `WalletReward` 상태 전이: `AVAILABLE → REDEEMED` 직행 (REDEEMING 경유 제거)
- `RedeemEvent.redeemSessionId` → `walletRewardId`로 교체
- 프론트엔드 RedeemScreen: 마운트 시 세션 생성 → 사장님 확인 후 단일 API 호출로 변경

---

## Backend — 삭제 (11 파일)

| 파일                                                          | 이유                  |
| ------------------------------------------------------------- | --------------------- |
| `redeem/domain/RedeemSession.java`                            | 엔티티 제거           |
| `redeem/domain/RedeemSessionStatus.java`                      | 세션 상태 enum        |
| `redeem/repository/RedeemSessionRepository.java`              | 세션 레포지토리       |
| `redeem/controller/dto/CreateRedeemSessionRequest.java`       | 세션 생성 DTO         |
| `redeem/controller/dto/RedeemSessionResponse.java`            | 세션 응답 DTO         |
| `redeem/controller/dto/PendingRedeemSessionItem.java`         | 터미널 DTO            |
| `redeem/controller/dto/PendingRedeemSessionListResponse.java` | 터미널 DTO            |
| `redeem/controller/TerminalRedeemApi.java`                    | 터미널 API 인터페이스 |
| `redeem/controller/TerminalRedeemController.java`             | 터미널 컨트롤러       |
| `redeem/service/TerminalRedeemService.java`                   | 터미널 서비스         |
| `test/.../redeem/domain/RedeemSessionTest.java`               | 세션 테스트           |

> 경로 prefix: `backend/src/main/java/com/project/kkookk/` (test는 `src/test/`)

---

## Backend — 수정 (12 파일)

### Domain 계층

**`wallet/domain/WalletRewardStatus.java`** — `REDEEMING` 제거

```java
public enum WalletRewardStatus {
    AVAILABLE, REDEEMED, EXPIRED
}
```

**`wallet/domain/WalletReward.java`** — 3개 메서드 변경

- `startRedeeming()` 삭제
- `cancelRedeeming()` 삭제
- `completeRedeem()` → `redeem()`으로 이름 변경, AVAILABLE에서 직접 REDEEMED로 전이:

```java
public void redeem() {
    if (!isAvailable()) {
        throw new IllegalStateException("Only AVAILABLE rewards can be redeemed");
    }
    this.status = WalletRewardStatus.REDEEMED;
    this.redeemedAt = LocalDateTime.now();
}
```

**`redeem/domain/RedeemEvent.java`** — `redeemSessionId` → `walletRewardId`

```java
@Column(name = "wallet_reward_id", nullable = false)
private Long walletRewardId;
```

**`redeem/domain/RedeemEventType.java`** — `REQUESTED` 제거, `COMPLETED`만 유지

### Repository 계층

**`redeem/repository/RedeemEventProjection.java`** — 필드 교체

- `getRedeemSessionId()` → `getWalletRewardId()`
- `getType()` 제거

**`redeem/repository/RedeemEventRepository.java`** — `findCompletedByStoreId` JPQL 수정

```sql
SELECT e.id as id, e.walletRewardId as walletRewardId,
       cw.nickname as customerNickname, sc.rewardName as rewardName,
       sc.title as stampCardTitle, e.result as result, e.occurredAt as occurredAt
FROM RedeemEvent e
JOIN WalletReward wr ON e.walletRewardId = wr.id
JOIN CustomerWallet cw ON e.walletId = cw.id
JOIN StampCard sc ON wr.stampCardId = sc.id
WHERE e.storeId = :storeId
AND e.result = com.project.kkookk.redeem.domain.RedeemEventResult.SUCCESS
ORDER BY e.occurredAt DESC
```

### Service 계층

**`redeem/service/CustomerRedeemService.java`** — 핵심 변경

- `createRedeemSession()` + `completeRedeemSession()` → `redeemReward()` 1개로 통합
- `RedeemSessionRepository` 의존성 제거, TTL_SECONDS 상수 제거
- 플로우: 리워드 조회 → 매장 ACTIVE 확인 → 만료 확인 → AVAILABLE 확인 → `reward.redeem()` → RedeemEvent 저장

### Controller 계층

**`redeem/controller/CustomerRedeemController.java`**

- `@RequestMapping`: `/api/customer/redeem-sessions` → `/api/customer/redeems`
- 2개 엔드포인트 → 1개 `POST /api/customer/redeems`

**`redeem/controller/CustomerRedeemApi.java`** — Swagger 어노테이션 업데이트

**`redeem/controller/owner/dto/RedeemEventResponse.java`** — `redeemSessionId` → `walletRewardId`, `type` 제거

**`wallet/dto/response/RedeemEventSummary.java`** — `redeemSessionId` → `walletRewardId`

**`global/exception/ErrorCode.java`** — 4개 에러코드 삭제

- `REDEEM_SESSION_ALREADY_EXISTS`, `REDEEM_SESSION_NOT_FOUND`, `REDEEM_SESSION_NOT_PENDING`, `REDEEM_SESSION_EXPIRED`

### Test

**`test/.../wallet/domain/WalletRewardTest.java`**

- `startRedeeming`, `cancelRedeeming` 관련 테스트 제거
- `completeRedeem` 테스트 → `redeem()` (AVAILABLE → REDEEMED 직접 전이) 테스트로 변경

---

## Backend — 생성 (2 파일)

**`redeem/controller/dto/RedeemRewardRequest.java`**

```java
public record RedeemRewardRequest(
    @NotNull Long walletRewardId
) {}
```

**`redeem/controller/dto/RedeemRewardResponse.java`**

```java
public record RedeemRewardResponse(
    Long walletRewardId,
    Long redeemEventId,
    String rewardName,
    LocalDateTime redeemedAt
) {}
```

---

## DB 마이그레이션

```sql
-- 1. redeem_event에 wallet_reward_id 컬럼 추가
ALTER TABLE redeem_event ADD COLUMN wallet_reward_id BIGINT NULL AFTER id;

-- 2. 기존 데이터 백필 (redeem_session 경유)
UPDATE redeem_event re
JOIN redeem_session rs ON re.redeem_session_id = rs.id
SET re.wallet_reward_id = rs.wallet_reward_id;

-- 3. NOT NULL 제약조건 적용
ALTER TABLE redeem_event MODIFY COLUMN wallet_reward_id BIGINT NOT NULL;

-- 4. 기존 컬럼 제거
ALTER TABLE redeem_event DROP COLUMN redeem_session_id;

-- 5. redeem_session 테이블 제거
DROP TABLE IF EXISTS redeem_session;

-- 6. REDEEMING 상태 잔여 데이터 정리
UPDATE wallet_reward SET status = 'AVAILABLE' WHERE status = 'REDEEMING';
```

---

## Frontend — 삭제 (1 파일)

| 파일                                              | 이유                  |
| ------------------------------------------------- | --------------------- |
| `features/redemption/components/TTLCountdown.tsx` | TTL 카운트다운 불필요 |

---

## Frontend — 수정 (7 파일)

**`lib/api/endpoints.ts`**

- `CUSTOMER.REDEEM_SESSIONS` + `REDEEM_SESSION_COMPLETE` → `CUSTOMER.REDEEMS: '/api/customer/redeems'`
- `TERMINAL.REDEEM_SESSIONS` 제거
- `QUERY_KEYS.pendingRedeemSessions` 제거

**`features/redemption/api/redeemApi.ts`** — 2개 함수 → 1개 `redeemReward()`

**`features/redemption/hooks/useRedeem.ts`** — 2개 훅 → 1개 `useRedeemReward()`

**`features/redemption/components/RedeemScreen.tsx`** — 핵심 UI 변경

- 마운트 시 세션 생성 제거, TTL 카운트다운 effect 제거
- 상태 머신: `'idle' | 'confirming' | 'processing' | 'success' | 'failed'`
- 플로우: 리워드 정보 표시 → "사용하기" → StaffConfirmModal → 사장님 확인 → 단일 API 호출 → 결과

**`features/redemption/components/index.ts`** — `TTLCountdown` export 제거

**`features/redemption/types.ts`** — 세션 관련 타입, `REDEEM_TTL_SECONDS` 제거

**`types/api.ts`**

- 삭제: `CreateRedeemSessionRequest`, `RedeemSessionStatus`, `RedeemSessionResponse`, `PendingRedeemSessionItem`, `PendingRedeemSessionListResponse`
- 추가: `RedeemRewardRequest`, `RedeemRewardResponse`
- 수정: `RedeemHistoryItem.redeemSessionId` → `walletRewardId`
- 수정: `RedeemEventResponse.redeemSessionId` → `walletRewardId`, `type` 제거
- 수정: `WalletRewardStatus`에서 `'REDEEMING'` 제거

**`types/domain.ts`** — `RedeemSession` 인터페이스, `RedeemSessionStatus` 타입 제거

**`features/terminal/api/terminalApi.ts`** — `getPendingRedeemSessions()` 함수 제거

**`features/terminal/hooks/useTerminal.ts`** — `usePendingRedeemSessions` 훅 제거

---

## Docs — 수정 (4 파일)

| 파일                           | 변경 내용                                                      |
| ------------------------------ | -------------------------------------------------------------- |
| `docs/api-reference.md`        | 세션 엔드포인트 3개 제거, `POST /api/customer/redeems` 추가    |
| `docs/feature-specs/redeem.md` | 전체 재작성 (단일 API 시퀀스, REDEEMING 상태 제거)             |
| `docs/architecture.md`         | 리딤 플로우 다이어그램 단순화, 상태 머신 업데이트              |
| `docs/prd-v2.md`               | 섹션 6.1.4 RedeemSession/TTL 제거, 6.3.2 터미널 리딤 폴링 축소 |

---

## 실행 순서

1. DB 마이그레이션 스크립트 준비
2. Backend domain (WalletReward, RedeemEvent, enum)
3. Backend repository (JPQL, Projection)
4. Backend service (CustomerRedeemService 단일 메서드)
5. Backend controller (새 DTO, 새 엔드포인트)
6. Backend 삭제 (RedeemSession 관련 11 파일)
7. Backend ErrorCode 정리
8. Backend 테스트 수정 및 실행: `./gradlew test`
9. Backend lint: `./gradlew spotlessApply`
10. Frontend 수정 (endpoints → api → hooks → types → components)
11. Frontend lint: `pnpm lint`
12. Docs 업데이트
13. DB 마이그레이션 실행

---

## 체크리스트

- [ ] Backend domain/repository/service/controller 변경
- [ ] DB 마이그레이션 스크립트
- [ ] Frontend API/hooks/components 변경
- [ ] 테스트 통과 (`./gradlew test`)
- [ ] Lint 통과 (`./gradlew spotlessApply`, `pnpm lint`)
- [ ] 문서 업데이트 (api-reference, feature-specs/redeem, architecture, prd-v2)
