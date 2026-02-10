# Feature: Issuance (스탬프 적립)

## Status: Implemented

---

## Overview

스탬프 적립은 KKOOKK의 핵심 플로우로, 고객이 적립을 요청하면 매장 터미널에서 승인/거절하는 **Approval-based** 시스템이다.
POS 연동 없이 고객 요청 -> 터미널 승인 -> 폴링 완료 방식으로 동작한다.

---

## Backend

| Layer | File Path |
|-------|-----------|
| Controller (Customer) | `backend/src/main/java/com/project/kkookk/issuance/controller/CustomerIssuanceController.java` |
| API Interface (Customer) | `backend/src/main/java/com/project/kkookk/issuance/controller/CustomerIssuanceApi.java` |
| Controller (Terminal) | `backend/src/main/java/com/project/kkookk/issuance/controller/TerminalApprovalController.java` |
| API Interface (Terminal) | `backend/src/main/java/com/project/kkookk/issuance/controller/TerminalApprovalApi.java` |
| Service (Customer) | `backend/src/main/java/com/project/kkookk/issuance/service/CustomerIssuanceService.java` |
| Service (Terminal) | `backend/src/main/java/com/project/kkookk/issuance/service/TerminalApprovalService.java` |
| Entity | `backend/src/main/java/com/project/kkookk/issuance/domain/IssuanceRequest.java` |
| Status Enum | `backend/src/main/java/com/project/kkookk/issuance/domain/IssuanceRequestStatus.java` |
| Repository | `backend/src/main/java/com/project/kkookk/issuance/repository/IssuanceRequestRepository.java` |

## Frontend

| Layer | File Path |
|-------|-----------|
| Feature Module | `frontend/src/features/issuance/` |
| API Client | `frontend/src/features/issuance/api/issuanceApi.ts` |
| Hooks | `frontend/src/features/issuance/hooks/useIssuance.ts` |
| Types | `frontend/src/features/issuance/types.ts` |
| Customer - Request Button | `frontend/src/features/issuance/components/customer/RequestStampButton.tsx` |
| Customer - Requesting View | `frontend/src/features/issuance/components/customer/RequestingView.tsx` |
| Customer - Result View | `frontend/src/features/issuance/components/customer/RequestResultView.tsx` |
| Customer - Reward Achieved | `frontend/src/features/issuance/components/customer/RewardAchievedView.tsx` |
| Terminal - Pending List | `frontend/src/features/issuance/components/terminal/PendingRequestsList.tsx` |
| Terminal Hooks | `frontend/src/features/terminal/hooks/useTerminal.ts` |

---

## API Endpoints

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| POST | `/api/customer/issuance-requests` | `CustomerIssuanceController.createIssuanceRequest()` | CUSTOMER | 적립 요청 생성 (TTL: 120s, idempotent key). 신규 201, 기존 200. |
| GET | `/api/customer/issuance-requests/{id}` | `CustomerIssuanceController.getIssuanceRequest()` | CUSTOMER | 적립 요청 상태 조회 (Polling, 2-3초 간격 권장). Lazy expiration 적용. |
| GET | `/api/terminal/{storeId}/issuance-requests` | `TerminalApprovalController.getPendingRequests()` | TERMINAL | 매장의 PENDING 상태 적립 요청 목록 조회. 만료된 요청은 자동 필터링. |
| POST | `/api/terminal/{storeId}/issuance-requests/{id}/approve` | `TerminalApprovalController.approveRequest()` | TERMINAL | 적립 승인. 스탬프 +1, StampEvent(ISSUED) 기록, Goal 도달 시 WalletReward 자동 발급. |
| POST | `/api/terminal/{storeId}/issuance-requests/{id}/reject` | `TerminalApprovalController.rejectRequest()` | TERMINAL | 적립 거절. 상태를 REJECTED로 변경. |

---

## Business Rules

- **Idempotency**: `walletId + idempotencyKey` Unique Constraint로 중복 방지. 동일 키로 재요청 시 기존 요청 반환 (200).
- **TTL**: 120초 (2분) 후 자동 EXPIRED. Lazy Expiration 방식 (조회 시 만료 처리).
- **매장 상태 체크**: Store가 ACTIVE 상태여야 적립 가능.
- **중복 PENDING 방지**: 동일 walletStampCardId에 PENDING 요청이 이미 존재하면 409 응답.
- **승인 시 처리**: `stampCount += 1`, `StampEvent(ISSUED)` 원장 기록, Goal 도달 시 `WalletReward` 자동 발급, 카드 순환(COMPLETED -> 새 카드) 지원.
- **Concurrency**: Pessimistic Lock on `IssuanceRequest` (findByIdWithLock), Pessimistic Lock on `WalletStampCard` (findByCustomerWalletIdAndStoreIdAndStatusWithLock).
- **스탬프 Delta**: 1회 승인당 1개 고정 (`STAMP_DELTA = 1`).
- **터미널 소유권 검증**: `Store.ownerAccountId == TerminalPrincipal.ownerId` 확인.

---

## Sequence Diagram

```
Customer App              Backend                    Terminal App
    |                        |                            |
    |--POST /api/customer/   |                            |
    |  issuance-requests     |                            |
    |  {storeId,             |                            |
    |   walletStampCardId,   |                            |
    |   idempotencyKey}      |                            |
    |                        |                            |
    |                        |--Validate: Store ACTIVE    |
    |                        |--Validate: Ownership       |
    |                        |--Validate: Idempotency     |
    |                        |--Validate: No PENDING      |
    |                        |--Create IssuanceRequest    |
    |                        |  (status=PENDING,          |
    |                        |   expiresAt=now()+120s)    |
    |                        |                            |
    |<--201 {id, PENDING,    |                            |
    |     expiresAt,         |                            |
    |     remainingSeconds}  |                            |
    |                        |                            |
    | [Poll every 2s]        |                            |
    |--GET /api/customer/    |                            |
    |  issuance-requests/{id}|                            |
    |                        |--Lazy Expiration Check     |
    |<--200 {PENDING,        |                            |
    |     remainingSeconds}  |                            |
    |                        |                            |
    |                        |     [Poll every 2s]        |
    |                        |<--GET /api/terminal/       |
    |                        |   {storeId}/issuance-      |
    |                        |   requests                 |
    |                        |--Filter: not expired       |
    |                        |--Batch: walletId->name     |
    |                        |--Return list with          |
    |                        |   customerName,            |
    |                        |   remainingSeconds-------->|
    |                        |                            |
    |                        |                            | [Owner taps Approve]
    |                        |<--POST /api/terminal/      |
    |                        |   {storeId}/issuance-      |
    |                        |   requests/{id}/approve    |
    |                        |                            |
    |                        |--Lock: IssuanceRequest     |
    |                        |--Lock: WalletStampCard     |
    |                        |--Validate: PENDING         |
    |                        |--Validate: Not expired     |
    |                        |--processStampAccumulation  |
    |                        |  (stampCount++,            |
    |                        |   rewardCheck,             |
    |                        |   cardCycleIfGoalReached)  |
    |                        |--request.approve(rewards)  |
    |                        |--StampEvent(ISSUED) save   |
    |                        |                            |
    |                        |--200 {APPROVED,            |
    |                        |   stampDelta=1,            |
    |                        |   currentStampCount}------>|
    |                        |                            |
    | [Next poll]            |                            |
    |--GET /api/customer/    |                            |
    |  issuance-requests/{id}|                            |
    |<--200 {APPROVED,       |                            |
    |     currentStampCount, |                            |
    |     rewardsIssued}     |                            |
    | [Polling End]          |                            |
    | [Invalidate wallet]    |                            |
```

---

## State Transitions

```
                  approve(rewardsIssued)
  [PENDING] ──────────────────────────────> [APPROVED]
      |
      |           reject()
      ├──────────────────────────────────> [REJECTED]
      |
      |           120s TTL (lazy expiration)
      └──────────────────────────────────> [EXPIRED]
```

- PENDING -> APPROVED: `TerminalApprovalService.approveRequest()` -- 스탬프/리워드 처리 후 상태 전이
- PENDING -> REJECTED: `TerminalApprovalService.rejectRequest()` -- 단순 상태 전이
- PENDING -> EXPIRED: `CustomerIssuanceService.getIssuanceRequest()` (lazy) 또는 `TerminalApprovalService.validateRequestCanBeProcessed()` -- 시간 경과 시 자동 전이

---

## DTO Field Specs

### CreateIssuanceRequest (Customer -> Backend)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `storeId` | Long | Yes | `@NotNull` | 매장 ID |
| `walletStampCardId` | Long | Yes | `@NotNull` | 지갑 스탬프카드 ID |
| `idempotencyKey` | String | Yes | `@NotBlank`, `@Size(max=64)` | 멱등성 키 (UUID 권장) |

### IssuanceRequestResponse (Backend -> Customer)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | Long | No | 요청 ID |
| `status` | IssuanceRequestStatus | No | PENDING / APPROVED / REJECTED / EXPIRED |
| `expiresAt` | LocalDateTime | No | 만료 시각 |
| `remainingSeconds` | Long | No | 남은 시간 (초, 최소 0) |
| `currentStampCount` | Integer | No | 현재 스탬프 개수 (승인 후 갱신된 값) |
| `rewardsIssued` | Integer | Yes | 발급된 리워드 개수 (승인 시에만 값 존재) |
| `createdAt` | LocalDateTime | No | 요청 생성 시각 |

### IssuanceRequestResult (Internal)

| Field | Type | Description |
|-------|------|-------------|
| `response` | IssuanceRequestResponse | 응답 DTO |
| `newlyCreated` | boolean | 신규 생성 여부 (true: 201, false: 200) |

### PendingIssuanceRequestItem (Backend -> Terminal)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 요청 ID |
| `customerName` | String | 고객명 (CustomerWallet.name, Batch 조회) |
| `requestedAt` | LocalDateTime | 요청 시각 |
| `elapsedSeconds` | long | 경과 시간 (초) |
| `remainingSeconds` | long | 만료까지 남은 시간 (초) |

### PendingIssuanceRequestListResponse (Backend -> Terminal)

| Field | Type | Description |
|-------|------|-------------|
| `items` | List\<PendingIssuanceRequestItem\> | 대기 요청 목록 |
| `count` | int | 대기 건수 |

### IssuanceApprovalResponse (Backend -> Terminal)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 요청 ID |
| `status` | IssuanceRequestStatus | APPROVED |
| `processedAt` | LocalDateTime | 처리 시각 |
| `stampDelta` | int | 적립된 스탬프 수 (항상 1) |
| `currentStampCount` | int | 고객 현재 스탬프 수 |

### IssuanceRejectionResponse (Backend -> Terminal)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 요청 ID |
| `status` | IssuanceRequestStatus | REJECTED |
| `processedAt` | LocalDateTime | 처리 시각 |

---

## Entity: IssuanceRequest

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Long (PK) | AUTO_INCREMENT | 요청 ID |
| `store_id` | Long | NOT NULL | 매장 ID |
| `wallet_id` | Long | NOT NULL | 고객 지갑 ID |
| `wallet_stamp_card_id` | Long | NOT NULL | 지갑 스탬프카드 ID |
| `status` | VARCHAR(20) | NOT NULL, ENUM | PENDING / APPROVED / REJECTED / EXPIRED |
| `idempotency_key` | VARCHAR(100) | UNIQUE(wallet_id, idempotency_key) | 멱등성 키 |
| `expires_at` | DATETIME(6) | NOT NULL | 만료 시각 |
| `approved_at` | DATETIME(6) | Nullable | 승인 시각 |
| `rewards_issued` | Integer | Nullable | 발급된 리워드 수 |
| `created_at` | DATETIME(6) | NOT NULL | 생성 시각 (BaseTimeEntity) |
| `modified_at` | DATETIME(6) | NOT NULL | 수정 시각 (BaseTimeEntity) |

---

## Edge Cases

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| 이미 PENDING 요청이 존재하는 카드에 재요청 | 409 | `ISSUANCE_REQUEST_ALREADY_PENDING` | 이미 대기 중인 적립 요청이 있습니다 |
| 동일 idempotencyKey로 재요청 (미만료) | 200 | - | 기존 요청 반환 (멱등성) |
| TTL 만료 후 터미널 승인 시도 | 410 | `ISSUANCE_REQUEST_EXPIRED` | 요청이 만료되었습니다 |
| 이미 처리된(APPROVED/REJECTED) 요청 재처리 | 409 | `ISSUANCE_ALREADY_PROCESSED` | 이미 처리된 요청입니다 |
| 비활성(INACTIVE) 매장에서 요청 | 403 | `STORE_INACTIVE` | 해당 매장은 현재 이용할 수 없습니다 |
| 존재하지 않는 매장 | 404 | `STORE_NOT_FOUND` | 매장을 찾을 수 없습니다 |
| 활성 스탬프카드가 없는 매장에서 승인 | 409 | `NO_ACTIVE_STAMP_CARD` | 활성 스탬프 카드가 없습니다 |
| 본인 소유가 아닌 지갑 스탬프카드 | 403 | `ACCESS_DENIED` | 접근 권한이 없습니다 |
| 터미널이 다른 매장 요청 접근 | 403 | `TERMINAL_ACCESS_DENIED` | 단말기 접근 권한이 없습니다 |
| 지갑 스탬프카드 미존재 | 404 | `WALLET_STAMP_CARD_NOT_FOUND` | 해당 지갑 스탬프카드를 찾을 수 없습니다 |
| 적립 요청 미존재 | 404 | `ISSUANCE_REQUEST_NOT_FOUND` | 적립 요청을 찾을 수 없습니다 |
| DB Unique Constraint 위반 (동시 요청) | 409 | `ISSUANCE_REQUEST_ALREADY_PENDING` | DataIntegrityViolation catch |
| Polling 시 PENDING + 만료 시간 초과 | 200 | - | Lazy Expiration: status를 EXPIRED로 전이 후 반환 |

---

## TanStack Query Keys

```typescript
// frontend/src/lib/api/endpoints.ts

// Customer - 적립 요청 상태 (Polling)
QUERY_KEYS.issuanceRequest = (id: number) => ['issuance', 'request', id] as const

// Terminal - 대기 중 적립 요청 목록 (Polling)
QUERY_KEYS.pendingIssuanceRequests = (storeId: number) =>
  ['terminal', storeId, 'pendingIssuances'] as const
```

### Polling Configuration

```typescript
// Customer: useIssuanceRequestStatus (useIssuance.ts)
refetchInterval: (query) => {
  const data = query.state.data;
  if (data?.status === 'PENDING' && data.remainingSeconds > 0) {
    return 2000; // 2초 간격
  }
  if (data?.status === 'APPROVED') {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  }
  return false; // 폴링 중단
}

// Terminal: usePendingIssuanceRequests (useTerminal.ts)
refetchInterval: 2000 // 2초 간격 (403/401 시 중단)
```

### Cache Invalidation

```typescript
// 적립 요청 생성 성공 시
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet'] })

// 터미널 승인/거절 성공 시
onSuccess: () => queryClient.invalidateQueries({
  queryKey: QUERY_KEYS.pendingIssuanceRequests(storeId)
})

// Customer 폴링에서 APPROVED 감지 시
queryClient.invalidateQueries({ queryKey: ['wallet'] })
```

---

## Related Features

| Feature | Relationship |
|---------|-------------|
| **Wallet** | 승인 시 `WalletStampCard.stampCount` 증가, Goal 도달 시 `WalletReward` 자동 발급 |
| **StampCard** | 매장의 ACTIVE StampCard가 있어야 승인 가능. `goalStampCount`, `rewardName` 참조 |
| **StampRewardService** | `processStampAccumulation()` 통해 스탬프 적립, 리워드 발급, 카드 순환 일괄 처리 |
| **StampEvent** | 승인 시 `StampEvent(ISSUED)` 원장 기록. `delta=1`, `reason="현장 승인"` |
| **Statistics** | StampEvent 집계를 통한 통계 제공 |
