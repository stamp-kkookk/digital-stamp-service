# Feature: Redeem (리워드 사용)

## Status: Implemented

---

## Overview

리워드 사용은 고객이 적립 보상(쿠폰)을 매장에서 사용하는 플로우이다.
**OTP Step-Up 인증 필수** -> 세션 생성 -> **2-step Confirm Modal (비가역적 액션)** -> 완료의 단계를 거치며,
60초 TTL 내에 완료하지 않으면 자동 만료된다.

---

## Backend

| Layer | File Path |
|-------|-----------|
| Controller (Customer) | `backend/src/main/java/com/project/kkookk/redeem/controller/CustomerRedeemController.java` |
| API Interface (Customer) | `backend/src/main/java/com/project/kkookk/redeem/controller/CustomerRedeemApi.java` |
| Service (Customer) | `backend/src/main/java/com/project/kkookk/redeem/service/CustomerRedeemService.java` |
| Service (Owner) | `backend/src/main/java/com/project/kkookk/redeem/service/OwnerRedeemEventService.java` |
| Entity - RedeemSession | `backend/src/main/java/com/project/kkookk/redeem/domain/RedeemSession.java` |
| Entity - RedeemEvent | `backend/src/main/java/com/project/kkookk/redeem/domain/RedeemEvent.java` |
| Enum - RedeemSessionStatus | `backend/src/main/java/com/project/kkookk/redeem/domain/RedeemSessionStatus.java` |
| Enum - RedeemEventType | `backend/src/main/java/com/project/kkookk/redeem/domain/RedeemEventType.java` |
| Enum - RedeemEventResult | `backend/src/main/java/com/project/kkookk/redeem/domain/RedeemEventResult.java` |
| Repository - RedeemSession | `backend/src/main/java/com/project/kkookk/redeem/repository/RedeemSessionRepository.java` |
| Repository - RedeemEvent | `backend/src/main/java/com/project/kkookk/redeem/repository/RedeemEventRepository.java` |

## Frontend

| Layer | File Path |
|-------|-----------|
| Feature Module | `frontend/src/features/redemption/` |
| API Client | `frontend/src/features/redemption/api/redeemApi.ts` |
| Hooks | `frontend/src/features/redemption/hooks/useRedeem.ts` |
| Types | `frontend/src/features/redemption/types.ts` |
| Redeem Screen | `frontend/src/features/redemption/components/RedeemScreen.tsx` |
| Reward Card | `frontend/src/features/redemption/components/RewardCard.tsx` |
| Reward List | `frontend/src/features/redemption/components/RewardList.tsx` |
| Result View | `frontend/src/features/redemption/components/RedeemResultView.tsx` |
| Staff Confirm Modal | `frontend/src/features/redemption/components/StaffConfirmModal.tsx` |
| TTL Countdown | `frontend/src/features/redemption/components/TTLCountdown.tsx` |

---

## API Endpoints

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| POST | `/api/customer/redeem-sessions` | `CustomerRedeemController.createRedeemSession()` | CUSTOMER + **STEPUP** | 리워드 사용 세션 생성 (TTL: 60s). OTP Step-Up 필수. |
| POST | `/api/customer/redeem-sessions/{id}/complete` | `CustomerRedeemController.completeRedeemSession()` | CUSTOMER | 리워드 사용 세션 완료 처리. 2-step confirm 후 호출. |

---

## Business Rules

- **OTP Step-Up 필수**: 세션 생성 시 `CustomerPrincipal.isStepUp()` 검증. 미인증 시 403 `STEPUP_REQUIRED`.
- **TTL**: 60초 (1분). 만료 시 자동 EXPIRED + WalletReward 상태 rollback (REDEEMING -> AVAILABLE).
- **2-Step Confirm**: 프론트엔드에서 비가역적 행위임을 확인하는 모달(`StaffConfirmModal`) 표시 후 complete API 호출.
- **WalletReward 상태 전이**: AVAILABLE -> REDEEMING (세션 생성 시) -> REDEEMED (완료 시) 또는 AVAILABLE (만료 rollback 시).
- **중복 세션 방지**: 동일 `walletRewardId`에 PENDING 세션이 이미 존재하면 409 응답.
- **매장 상태 체크**: Store가 ACTIVE 상태여야 세션 생성 가능.
- **리워드 유효기간**: `WalletReward.expiresAt` 이후이면 410 `REWARD_EXPIRED`.
- **원장 기록**: 완료 시 `RedeemEvent(COMPLETED, SUCCESS)` 저장.

---

## Sequence Diagram

```
Customer App              Backend
    |                        |
    | [1. OTP Step-Up]       |
    |--POST /api/public/     |
    |  otp/request           |
    |<--OTP sent via SMS-----|
    |                        |
    |--POST /api/public/     |
    |  otp/verify            |
    |  {code}                |
    |<--{stepUpToken}--------|
    |                        |
    | [2. Create Session]    |
    |--POST /api/customer/   |
    |  redeem-sessions       |
    |  {walletRewardId}      |
    |  [Authorization:       |
    |   Bearer stepUpToken]  |
    |                        |
    |                        |--Validate: StepUp auth
    |                        |--Validate: Reward owner
    |                        |--Validate: Store ACTIVE
    |                        |--Validate: Not expired
    |                        |--Validate: AVAILABLE
    |                        |--Validate: No PENDING sess
    |                        |--WalletReward: AVAILABLE
    |                        |   -> REDEEMING
    |                        |--Create RedeemSession
    |                        |  (PENDING, TTL=60s)
    |                        |
    |<--201 {sessionId,      |
    |     PENDING,           |
    |     expiresAt,         |
    |     remainingSeconds}  |
    |                        |
    | [3. Show to Staff]     |
    | [TTL Countdown UI]     |
    |                        |
    | [4. Staff Confirms]    |
    | [2-Step Confirm Modal] |
    | [User taps "Confirm"]  |
    |                        |
    |--POST /api/customer/   |
    |  redeem-sessions/      |
    |  {id}/complete         |
    |                        |
    |                        |--Validate: Session owner
    |                        |--Validate: PENDING
    |                        |--Validate: Not expired
    |                        |--RedeemSession: PENDING
    |                        |   -> COMPLETED
    |                        |--WalletReward: REDEEMING
    |                        |   -> REDEEMED
    |                        |--RedeemEvent(COMPLETED,
    |                        |   SUCCESS) save
    |                        |
    |<--200 {sessionId,      |
    |     COMPLETED,         |
    |     remainingSeconds=0}|
    | [Show Result View]     |
    | [Invalidate rewards]   |
```

### TTL Expiry Flow

```
Customer App              Backend
    |                        |
    | [TTL expires (60s)]    |
    |--POST /complete------->|
    |                        |--Check: isExpired() = true
    |                        |--session.expire()
    |                        |--reward.cancelRedeeming()
    |                        |   (REDEEMING -> AVAILABLE)
    |<--410 REDEEM_SESSION_  |
    |     EXPIRED            |
```

---

## State Transitions

### RedeemSession Status

```
                  complete()
  [PENDING] ──────────────────────────────> [COMPLETED]
      |
      |           60s TTL (lazy on complete attempt)
      └──────────────────────────────────> [EXPIRED]
```

### WalletReward Status (related)

```
                  startRedeeming()              completeRedeem()
  [AVAILABLE] ─────────────────> [REDEEMING] ────────────────> [REDEEMED]
       ^                              |
       |         cancelRedeeming()    |
       └──────────────────────────────┘
                (on session expiry)

  [AVAILABLE] ─── expire() ──> [EXPIRED]
  [REDEEMING] ── expire() ──> [EXPIRED]
```

---

## DTO Field Specs

### CreateRedeemSessionRequest (Customer -> Backend)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `walletRewardId` | Long | Yes | `@NotNull` | 지갑 리워드 ID |

### RedeemSessionResponse (Backend -> Customer)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `sessionId` | Long | No | 세션 ID |
| `walletRewardId` | Long | No | 지갑 리워드 ID |
| `status` | RedeemSessionStatus | No | PENDING / COMPLETED / EXPIRED |
| `expiresAt` | LocalDateTime | No | 만료 시각 |
| `remainingSeconds` | Long | No | 남은 시간 (초, 최소 0) |
| `createdAt` | LocalDateTime | No | 생성 시각 |

---

## Entity: RedeemSession

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Long (PK) | AUTO_INCREMENT | 세션 ID |
| `wallet_reward_id` | Long | NOT NULL | 지갑 리워드 ID |
| `status` | VARCHAR(20) | NOT NULL, ENUM | PENDING / COMPLETED / EXPIRED |
| `expires_at` | DATETIME(6) | NOT NULL | 만료 시각 |
| `completed_at` | DATETIME(6) | Nullable | 완료 시각 |
| `created_at` | DATETIME(6) | NOT NULL | 생성 시각 (BaseTimeEntity) |
| `modified_at` | DATETIME(6) | NOT NULL | 수정 시각 (BaseTimeEntity) |

## Entity: RedeemEvent

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Long (PK) | AUTO_INCREMENT | 이벤트 ID |
| `redeem_session_id` | Long | NOT NULL | 리딤 세션 ID |
| `wallet_id` | Long | NOT NULL | 고객 지갑 ID |
| `store_id` | Long | NOT NULL | 매장 ID |
| `type` | VARCHAR(30) | NOT NULL, ENUM | RedeemEventType (COMPLETED 등) |
| `result` | VARCHAR(20) | NOT NULL, ENUM | RedeemEventResult (SUCCESS 등) |
| `occurred_at` | DATETIME(6) | NOT NULL | 발생 시각 |
| `created_at` | DATETIME(6) | NOT NULL | 생성 시각 (BaseTimeEntity) |
| `modified_at` | DATETIME(6) | NOT NULL | 수정 시각 (BaseTimeEntity) |

---

## Edge Cases

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| OTP Step-Up 미인증 상태에서 세션 생성 | 403 | `STEPUP_REQUIRED` | OTP 인증이 필요합니다 |
| 존재하지 않는 리워드 ID | 404 | `REWARD_NOT_FOUND` | 리워드를 찾을 수 없습니다 |
| 다른 고객의 리워드로 세션 생성 시도 | 404 | `REWARD_NOT_FOUND` | findByIdAndWalletId 미조회 |
| 리워드가 AVAILABLE이 아닌 상태 (REDEEMING/REDEEMED) | 409 | `REWARD_NOT_AVAILABLE` | 사용 가능한 리워드가 아닙니다 |
| 리워드 유효기간 만료 | 410 | `REWARD_EXPIRED` | 리워드 유효기간이 만료되었습니다 |
| 동일 리워드에 이미 PENDING 세션 존재 | 409 | `REDEEM_SESSION_ALREADY_EXISTS` | 이미 진행 중인 사용 요청이 있습니다 |
| 비활성(INACTIVE) 매장의 리워드 사용 | 403 | `STORE_INACTIVE` | 해당 매장은 현재 이용할 수 없습니다 |
| 존재하지 않는 세션 ID로 완료 요청 | 404 | `REDEEM_SESSION_NOT_FOUND` | 사용 세션을 찾을 수 없습니다 |
| 이미 COMPLETED/EXPIRED된 세션 완료 시도 | 400 | `REDEEM_SESSION_NOT_PENDING` | 처리 대기 중인 세션이 아닙니다 |
| TTL 만료 후 완료 시도 | 410 | `REDEEM_SESSION_EXPIRED` | 사용 세션이 만료되었습니다 (reward rollback 수행) |
| 매장 미존재 | 404 | `STORE_NOT_FOUND` | 매장을 찾을 수 없습니다 |

---

## TanStack Query Keys

```typescript
// frontend/src/lib/api/endpoints.ts

// Customer - 리워드 목록
QUERY_KEYS.walletRewards = (status?: string) =>
  ['wallet', 'rewards', { status }] as const

// Customer - 리딤 히스토리
QUERY_KEYS.redeemHistory = (storeId: number) =>
  ['wallet', 'redeemHistory', storeId] as const
```

### Hooks

```typescript
// useCreateRedeemSession (useRedeem.ts)
// Mutation: POST /api/customer/redeem-sessions
// onSuccess: invalidateQueries(['wallet', 'rewards'])

// useCompleteRedeemSession (useRedeem.ts)
// Mutation: POST /api/customer/redeem-sessions/{id}/complete
// onSuccess: invalidateQueries(['wallet', 'rewards']), invalidateQueries(['wallet', 'redeemHistory'])
```

### Cache Invalidation

```typescript
// 세션 생성 성공 시
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet', 'rewards'] })

// 세션 완료 성공 시
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['wallet', 'rewards'] });
  queryClient.invalidateQueries({ queryKey: ['wallet', 'redeemHistory'] });
}
```

---

## Frontend UI Flow

```
[Reward List]                [Redeem Screen]              [Result View]
    |                            |                            |
    | User taps "Use"            |                            |
    |--Check StepUp valid------->|                            |
    | (if not, OTP flow first)   |                            |
    |                            |                            |
    |      [StaffConfirmModal]   |                            |
    |      "리워드를 사용하시겠   |                            |
    |       습니까? 이 작업은     |                            |
    |       되돌릴 수 없습니다."  |                            |
    |      [Cancel] [Confirm]    |                            |
    |                            |                            |
    |      User taps "Confirm"   |                            |
    |      createRedeemSession() |                            |
    |                            |                            |
    |                       [TTLCountdown]                    |
    |                       60s countdown                     |
    |                       "직원에게 보여주세요"               |
    |                            |                            |
    |      Staff confirms        |                            |
    |      completeRedeemSession |                            |
    |                            |                            |
    |                            |--[RedeemResultView]------->|
    |                            |  "사용이 완료되었습니다"     |
```

---

## Related Features

| Feature | Relationship |
|---------|-------------|
| **Wallet** | `WalletReward` 상태 관리. 리워드 보관함에서 사용 가능한 리워드 조회 |
| **OTP** | Step-Up 인증 토큰 발급. 리딤 전 OTP 인증 필수 |
| **Issuance** | 적립 완료 -> Goal 도달 시 `WalletReward` 자동 발급 -> 리딤 가능 |
| **StampCard** | `rewardName`, `title` 등 리워드 메타 정보 참조 |
| **Statistics** | `RedeemEvent` 집계를 통한 통계 제공 (Owner 대시보드) |
