# Feature: Wallet (고객 지갑)

## Status: Implemented

---

## Overview

Wallet은 고객의 스탬프카드, 적립 히스토리, 리워드 보관함을 관리하는 **읽기 중심(Read-only)** 기능이다.
고객은 지갑을 통해 보유한 스탬프카드 목록(캐러셀), 카드 상세 정보, 매장별 적립/사용 히스토리, 리워드 보관함을 조회할 수 있다.
히스토리와 리워드 조회에는 **OTP Step-Up 인증이 필수**이며, 무한 스크롤(Infinite Scroll) 페이지네이션을 지원한다.

---

## Backend

| Layer | File Path |
|-------|-----------|
| Controller (Auth) | `backend/src/main/java/com/project/kkookk/wallet/controller/WalletController.java` |
| API Interface (Auth) | `backend/src/main/java/com/project/kkookk/wallet/controller/WalletApi.java` |
| Controller (Customer) | `backend/src/main/java/com/project/kkookk/wallet/controller/customer/CustomerWalletController.java` |
| API Interface (Customer) | `backend/src/main/java/com/project/kkookk/wallet/controller/customer/CustomerWalletApi.java` |
| Service | `backend/src/main/java/com/project/kkookk/wallet/service/CustomerWalletService.java` |
| Entity - CustomerWallet | `backend/src/main/java/com/project/kkookk/wallet/domain/CustomerWallet.java` |
| Entity - WalletStampCard | `backend/src/main/java/com/project/kkookk/wallet/domain/WalletStampCard.java` |
| Entity - WalletReward | `backend/src/main/java/com/project/kkookk/wallet/domain/WalletReward.java` |
| Enum - CustomerWalletStatus | `backend/src/main/java/com/project/kkookk/wallet/domain/CustomerWalletStatus.java` |
| Enum - WalletStampCardStatus | `backend/src/main/java/com/project/kkookk/wallet/domain/WalletStampCardStatus.java` |
| Enum - WalletRewardStatus | `backend/src/main/java/com/project/kkookk/wallet/domain/WalletRewardStatus.java` |
| Enum - StampCardSortType | `backend/src/main/java/com/project/kkookk/wallet/domain/StampCardSortType.java` |
| Repository - CustomerWallet | `backend/src/main/java/com/project/kkookk/wallet/repository/CustomerWalletRepository.java` |
| Repository - WalletStampCard | `backend/src/main/java/com/project/kkookk/wallet/repository/WalletStampCardRepository.java` |
| Repository - WalletReward | `backend/src/main/java/com/project/kkookk/wallet/repository/WalletRewardRepository.java` |

## Frontend

| Layer | File Path |
|-------|-----------|
| Feature Module | `frontend/src/features/wallet/` |
| API Client | `frontend/src/features/wallet/api/walletApi.ts` |
| Hooks | `frontend/src/features/wallet/hooks/useWallet.ts` |
| Types | `frontend/src/features/wallet/types.ts` |
| Wallet Page | `frontend/src/features/wallet/pages/WalletPage.tsx` |
| Wallet Header | `frontend/src/features/wallet/components/WalletHeader.tsx` |
| Stamp Card Carousel | `frontend/src/features/wallet/components/StampCardCarousel.tsx` |
| Stamp Card Item | `frontend/src/features/wallet/components/StampCardItem.tsx` |
| Card Detail View | `frontend/src/features/wallet/components/CardDetailView.tsx` |
| Card Design Utils | `frontend/src/features/wallet/utils/cardDesign.ts` |

---

## API Endpoints

### Public API (Auth Not Required)

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| POST | `/api/public/wallet/register` | `WalletController.register()` | None | 지갑 생성 + JWT 발급. storeId 있으면 WalletStampCard 자동 생성. |
| POST | `/api/public/wallet/login` | `WalletController.login()` | None | 고객 로그인. 해당 매장 WalletStampCard 자동 발급 + 전체 카드 목록 반환. |

### Customer API (JWT Required)

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| GET | `/api/customer/wallet/my-stamp-cards` | `CustomerWalletController.getMyStampCards()` | CUSTOMER | 내 스탬프카드 목록 조회. 정렬: LAST_STAMPED / CREATED / PROGRESS. |
| GET | `/api/customer/wallet/stamp-cards` | `CustomerWalletController.getStampCardsByPhoneAndName()` | None (Deprecated) | 전화번호+이름으로 스탬프카드 목록 조회 (하위 호환용). |
| GET | `/api/customer/wallet/stores/{storeId}/stamp-history` | `CustomerWalletController.getStampHistory()` | CUSTOMER + **STEPUP** | 매장별 스탬프 적립 히스토리 조회. 페이지네이션. |
| GET | `/api/customer/wallet/stores/{storeId}/redeem-history` | `CustomerWalletController.getRedeemHistory()` | CUSTOMER + **STEPUP** | 매장별 리워드 사용 히스토리 조회. 페이지네이션. |
| GET | `/api/customer/wallet/rewards` | `CustomerWalletController.getRewards()` | CUSTOMER + **STEPUP** | 리워드 보관함 조회. 상태 필터 + 페이지네이션. |

---

## Business Rules

### Wallet Registration & Login

- **Registration**: 전화번호 중복 체크 -> CustomerWallet 생성 -> storeId가 있으면 해당 매장 ACTIVE StampCard로 WalletStampCard 자동 생성 -> JWT 토큰 발급 (일반 CUSTOMER, STEPUP 아님).
- **Login**: 전화번호+이름으로 조회 -> BLOCKED 상태 체크 -> 해당 매장 WalletStampCard 자동 발급 -> 전체 ACTIVE 카드 목록 (현재 매장 우선 정렬) -> JWT 토큰 발급.

### Stamp Card Listing

- **ACTIVE 상태만** 조회 (COMPLETED 제외).
- **정렬 옵션**: `StampCardSortType` enum
  - `LAST_STAMPED`: 최근 적립 순 (기본값)
  - `CREATED`: 생성 순
  - `PROGRESS`: 진행률 순 (메모리 정렬)
- **N+1 방지**: StampCard, Store Batch 조회 후 매핑.
- **Progress 계산**: `(currentStampCount * 100.0) / goalStampCount`

### History & Rewards

- **Step-Up 필수**: 히스토리 및 리워드 조회 시 OTP Step-Up 토큰 필요.
- **페이지네이션**: `page` (0-based), `size` (1~100, 기본 20).
- **Stamp History**: 매장별 StampEvent 조회. 해당 매장에 WalletStampCard가 있어야 조회 가능.
- **Redeem History**: 매장별 RedeemEvent 조회. `occurredAt DESC` 정렬.
- **Rewards**: 전체 또는 상태별 필터 (AVAILABLE / REDEEMING / REDEEMED / EXPIRED). `issuedAt DESC` 정렬.
- **BLOCKED 지갑**: 스탬프카드 목록 조회 시 BLOCKED 상태이면 403 응답.

### Auto WalletStampCard Creation

- 로그인/회원가입 시 해당 매장의 ACTIVE StampCard가 존재하면 자동으로 WalletStampCard 생성 (stampCount=0).
- 이미 해당 매장에 ACTIVE WalletStampCard가 존재하면 생성하지 않음.

---

## Sequence Diagram

### Registration Flow

```
Customer App              Backend
    |                        |
    |--POST /api/public/     |
    |  wallet/register       |
    |  {phone, name,         |
    |   nickname, storeId}   |
    |                        |
    |                        |--Check: phone duplicate
    |                        |--Create CustomerWallet
    |                        |   (status=ACTIVE)
    |                        |
    |                        |--If storeId present:
    |                        |  --Find ACTIVE StampCard
    |                        |  --Create WalletStampCard
    |                        |     (stampCount=0,
    |                        |      status=ACTIVE)
    |                        |
    |                        |--Generate JWT token
    |                        |   (CUSTOMER role,
    |                        |    not STEPUP)
    |                        |
    |<--201 {accessToken,    |
    |     walletId,          |
    |     phone, name,       |
    |     nickname,          |
    |     stampCardInfo}     |
```

### Login Flow

```
Customer App              Backend
    |                        |
    |--POST /api/public/     |
    |  wallet/login          |
    |  {phone, name, storeId}|
    |                        |
    |                        |--Find by phone+name
    |                        |--Check: not BLOCKED
    |                        |--Ensure WalletStampCard
    |                        |   for storeId
    |                        |--Get all ACTIVE cards
    |                        |   (current store first,
    |                        |    then lastStampedAt DESC)
    |                        |--Batch: StampCard, Store
    |                        |--Generate JWT token
    |                        |
    |<--200 {accessToken,    |
    |     walletId,          |
    |     phone, name,       |
    |     nickname,          |
    |     stampCards: [...]}  |
```

### Wallet Home (Stamp Card Carousel)

```
Customer App              Backend
    |                        |
    |--GET /api/customer/    |
    |  wallet/my-stamp-cards |
    |  ?sortBy=LAST_STAMPED  |
    |  [Authorization: JWT]  |
    |                        |
    |                        |--Find CustomerWallet
    |                        |--Check: not BLOCKED
    |                        |--Get ACTIVE WalletStampCards
    |                        |   (sorted by sortBy)
    |                        |--Batch: StampCard, Store
    |                        |--If PROGRESS sort:
    |                        |   Memory sort by progress%
    |                        |--Build summary list
    |                        |
    |<--200 {customerWalletId,|
    |     customerName,       |
    |     stampCards: [       |
    |       {walletStampCardId,|
    |        title,            |
    |        currentStampCount,|
    |        goalStampCount,   |
    |        progressPercentage,|
    |        nextRewardName,   |
    |        stampsToNextReward,|
    |        expiresAt,        |
    |        designJson,       |
    |        store: {...},     |
    |        lastStampedAt}    |
    |     ]}                   |
    |                          |
    | [Render Carousel UI]     |
```

### Stamp History (Infinite Scroll)

```
Customer App              Backend
    |                        |
    | [Step-Up Required]     |
    |--GET /api/customer/    |
    |  wallet/stores/        |
    |  {storeId}/stamp-      |
    |  history?page=0&size=20|
    |  [Authorization:       |
    |   Bearer stepUpToken]  |
    |                        |
    |                        |--Check: StepUp auth
    |                        |--Validate: WalletStampCard
    |                        |   exists for storeId
    |                        |--Query: StampEvent page
    |                        |   (occurredAt DESC)
    |                        |
    |<--200 {events: [...],  |
    |     pageInfo: {        |
    |       pageNumber,      |
    |       totalPages,      |
    |       totalElements,   |
    |       size,            |
    |       hasNext}}        |
    |                        |
    | [User scrolls down]    |
    |--GET ...?page=1&size=20|
    |<--200 {next page}      |
```

---

## State Transitions

### CustomerWallet Status

```
  [ACTIVE] ── block() ──> [BLOCKED]
  [BLOCKED] ── activate() ──> [ACTIVE]
```

### WalletStampCard Status

```
  [ACTIVE] ── complete() ──> [COMPLETED]
```

- ACTIVE: 적립 가능한 활성 카드
- COMPLETED: Goal 도달 후 카드 순환 시. 더 이상 적립 불가.

### WalletReward Status

```
                  startRedeeming()              completeRedeem()
  [AVAILABLE] ─────────────────> [REDEEMING] ────────────────> [REDEEMED]
       ^                              |
       |         cancelRedeeming()    |
       └──────────────────────────────┘

  [AVAILABLE] ── expire() ──> [EXPIRED]
  [REDEEMING] ── expire() ──> [EXPIRED]
```

- AVAILABLE: 사용 가능. `expiresAt`이 null이면 무제한, 있으면 해당 시각까지 유효.
- REDEEMING: 리딤 세션 진행 중. 세션 만료 시 AVAILABLE로 rollback.
- REDEEMED: 사용 완료. `redeemedAt` 기록.
- EXPIRED: 유효기간 만료. `expiresAt != null && now > expiresAt`.

### Expiry Calculation

```
WalletReward.isExpired() = status == EXPIRED || (expiresAt != null && now > expiresAt)
WalletReward.isAvailable() = status == AVAILABLE && (expiresAt == null || now < expiresAt)
```

---

## DTO Field Specs

### WalletRegisterRequest (Customer -> Backend)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | String | Yes | 전화번호 (고유) |
| `name` | String | Yes | 이름 |
| `nickname` | String | Yes | 닉네임 |
| `storeId` | Long | No | 매장 ID (있으면 자동 카드 생성) |

### WalletRegisterResponse (Backend -> Customer)

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | String | JWT 토큰 |
| `walletId` | Long | 지갑 ID |
| `phone` | String | 전화번호 |
| `name` | String | 이름 |
| `nickname` | String | 닉네임 |
| `stampCardInfo` | RegisteredStampCardInfo | 자동 생성된 카드 정보 (nullable) |

### CustomerLoginRequest (Customer -> Backend)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | String | Yes | 전화번호 |
| `name` | String | Yes | 이름 |
| `storeId` | Long | Yes | 매장 ID |

### CustomerLoginResponse (Backend -> Customer)

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | String | JWT 토큰 |
| `walletId` | Long | 지갑 ID |
| `phone` | String | 전화번호 |
| `name` | String | 이름 |
| `nickname` | String | 닉네임 |
| `stampCards` | List\<WalletStampCardSummary\> | 전체 ACTIVE 카드 (현재 매장 우선) |

### WalletStampCardListResponse (Backend -> Customer)

| Field | Type | Description |
|-------|------|-------------|
| `customerWalletId` | Long | 고객 지갑 ID |
| `customerName` | String | 고객 이름 |
| `stampCards` | List\<WalletStampCardSummary\> | 보유 스탬프카드 목록 |

### WalletStampCardSummary

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `walletStampCardId` | Long | No | 지갑 스탬프카드 ID |
| `stampCardId` | Long | No | 스탬프카드 ID |
| `title` | String | No | 스탬프카드 제목 |
| `currentStampCount` | Integer | No | 현재 적립된 스탬프 개수 |
| `goalStampCount` | Integer | No | 목표 스탬프 개수 |
| `progressPercentage` | Integer | No | 진행률 (%) |
| `nextRewardName` | String | No | 다음 보상 이름 |
| `nextRewardQuantity` | Integer | No | 다음 보상 수량 |
| `stampsToNextReward` | Integer | No | 다음 보상까지 필요한 스탬프 수 (최소 0) |
| `expiresAt` | LocalDateTime | Yes | 유효기간 만료일 (null이면 무제한) |
| `status` | StampCardStatus | No | 스탬프카드 상태 |
| `designJson` | String | Yes | 디자인 JSON |
| `store` | StoreInfo | No | 매장 정보 (id, name) |
| `lastStampedAt` | LocalDateTime | Yes | 마지막 적립 일시 |

### StoreInfo

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 매장 ID |
| `name` | String | 매장 이름 |

### StampEventHistoryResponse (Backend -> Customer)

| Field | Type | Description |
|-------|------|-------------|
| `events` | List\<StampEventSummary\> | 스탬프 이벤트 목록 |
| `pageInfo` | PageInfo | 페이지 정보 |

### StampEventSummary

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 스탬프 이벤트 ID |
| `type` | StampEventType | ISSUED / MIGRATED / ADJUSTED 등 |
| `delta` | Integer | 스탬프 증감량 |
| `reason` | String | 사유 |
| `occurredAt` | LocalDateTime | 발생 일시 |

### RedeemEventHistoryResponse (Backend -> Customer)

| Field | Type | Description |
|-------|------|-------------|
| `events` | List\<RedeemEventSummary\> | 리딤 이벤트 목록 |
| `pageInfo` | PageInfo | 페이지 정보 |

### WalletRewardListResponse (Backend -> Customer)

| Field | Type | Description |
|-------|------|-------------|
| `rewards` | List\<WalletRewardItem\> | 리워드 목록 |
| `pageInfo` | PageInfo | 페이지 정보 |

### WalletRewardItem

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | Long | No | 리워드 ID |
| `store` | StoreInfo | No | 매장 정보 |
| `rewardName` | String | Yes | 리워드명 |
| `stampCardTitle` | String | Yes | 스탬프카드 제목 |
| `status` | WalletRewardStatus | No | AVAILABLE / REDEEMING / REDEEMED / EXPIRED |
| `issuedAt` | LocalDateTime | No | 발급일시 |
| `expiresAt` | LocalDateTime | Yes | 만료일시 (null이면 무제한) |
| `redeemedAt` | LocalDateTime | Yes | 사용일시 (사용한 경우) |
| `designType` | StampCardDesignType | Yes | 스탬프카드 디자인 타입 |
| `designJson` | String | Yes | 스탬프카드 디자인 JSON |

### PageInfo

| Field | Type | Description |
|-------|------|-------------|
| `pageNumber` | int | 현재 페이지 번호 (0-based) |
| `totalPages` | int | 전체 페이지 수 |
| `totalElements` | long | 전체 요소 수 |
| `size` | int | 페이지 크기 |
| `hasNext` | boolean | 다음 페이지 존재 여부 |

---

## Entity: CustomerWallet

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Long (PK) | AUTO_INCREMENT | 지갑 ID |
| `phone` | VARCHAR(30) | NOT NULL, UNIQUE | 전화번호 |
| `name` | VARCHAR(50) | NOT NULL | 이름 |
| `nickname` | VARCHAR(50) | NOT NULL, UNIQUE | 닉네임 |
| `status` | VARCHAR(20) | NOT NULL, ENUM | ACTIVE / BLOCKED |
| `created_at` | DATETIME(6) | NOT NULL | 생성 시각 |
| `modified_at` | DATETIME(6) | NOT NULL | 수정 시각 |

## Entity: WalletStampCard

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Long (PK) | AUTO_INCREMENT | 지갑 스탬프카드 ID |
| `customer_wallet_id` | Long | NOT NULL | 고객 지갑 ID (FK) |
| `store_id` | Long | NOT NULL | 매장 ID (FK) |
| `stamp_card_id` | Long | NOT NULL | 스탬프카드 ID (FK) |
| `stamp_count` | Integer | NOT NULL, default 0 | 현재 적립 스탬프 수 |
| `status` | VARCHAR(20) | NOT NULL, ENUM | ACTIVE / COMPLETED |
| `last_stamped_at` | DATETIME(6) | Nullable | 마지막 적립 일시 |
| `completed_at` | DATETIME(6) | Nullable | 완료 일시 |
| `version` | Long | Optimistic Lock | 낙관적 락 버전 |
| `created_at` | DATETIME(6) | NOT NULL | 생성 시각 |
| `modified_at` | DATETIME(6) | NOT NULL | 수정 시각 |

## Entity: WalletReward

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Long (PK) | AUTO_INCREMENT | 리워드 ID |
| `wallet_id` | Long | NOT NULL | 고객 지갑 ID |
| `stamp_card_id` | Long | NOT NULL | 스탬프카드 ID |
| `store_id` | Long | NOT NULL | 매장 ID |
| `status` | VARCHAR(20) | NOT NULL, ENUM | AVAILABLE / REDEEMING / REDEEMED / EXPIRED |
| `issued_at` | DATETIME(6) | NOT NULL | 발급 일시 |
| `expires_at` | DATETIME(6) | Nullable | 만료 일시 (null이면 무제한) |
| `redeemed_at` | DATETIME(6) | Nullable | 사용 일시 |
| `created_at` | DATETIME(6) | NOT NULL | 생성 시각 |
| `modified_at` | DATETIME(6) | NOT NULL | 수정 시각 |

---

## Edge Cases

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| 이미 등록된 전화번호로 회원가입 | 409 | `WALLET_001` | 이미 등록된 전화번호입니다 |
| 이미 사용 중인 닉네임으로 회원가입 | 409 | `WALLET_002` | 이미 사용 중인 닉네임입니다 |
| 전화번호+이름으로 지갑 미발견 (로그인) | 404 | `CUSTOMER_WALLET_NOT_FOUND` | 해당 전화번호와 이름으로 지갑을 찾을 수 없습니다 |
| 차단된(BLOCKED) 지갑으로 로그인 | 403 | `CUSTOMER_WALLET_BLOCKED` | 차단된 지갑입니다 |
| 차단된(BLOCKED) 지갑으로 카드 목록 조회 | 403 | `CUSTOMER_WALLET_BLOCKED` | 차단된 지갑입니다 |
| Step-Up 미인증으로 히스토리/리워드 조회 | 403 | `STEPUP_REQUIRED` | OTP 인증이 필요합니다 |
| 해당 매장에 WalletStampCard 미존재 (히스토리) | 404 | `WALLET_STAMP_CARD_NOT_FOUND` | 해당 매장의 스탬프카드를 찾을 수 없습니다 |
| 매장 미존재 (히스토리) | 404 | `STORE_NOT_FOUND` | 매장을 찾을 수 없습니다 |
| 매장에 ACTIVE StampCard 없음 (자동 카드 생성 시) | - | - | WalletStampCard 생성 스킵 (warn 로그) |
| 잘못된 페이징 파라미터 (size > 100) | 400 | - | Bean Validation 에러 |

---

## TanStack Query Keys

```typescript
// frontend/src/lib/api/endpoints.ts

// 스탬프카드 목록
QUERY_KEYS.walletStampCards = (storeId: number) =>
  ['wallet', 'stampCards', storeId] as const

// 스탬프 히스토리
QUERY_KEYS.stampHistory = (storeId: number) =>
  ['wallet', 'stampHistory', storeId] as const

// 리딤 히스토리
QUERY_KEYS.redeemHistory = (storeId: number) =>
  ['wallet', 'redeemHistory', storeId] as const

// 리워드 보관함
QUERY_KEYS.walletRewards = (status?: string) =>
  ['wallet', 'rewards', { status }] as const

// 매장 요약
QUERY_KEYS.storeSummary = (storeId: number) =>
  ['customer', 'store', storeId, 'summary'] as const
```

### Hooks

```typescript
// useWalletStampCards (useWallet.ts)
// Query: GET /api/customer/wallet/my-stamp-cards
// refetchOnMount: 'always'
// enabled: !!storeId

// useStoreSummary (useWallet.ts)
// Query: GET /api/customer/stores/{storeId}/summary
// staleTime: 5 * 60 * 1000 (5분)

// useStampHistory (useWallet.ts)
// Query: GET /api/customer/wallet/stores/{storeId}/stamp-history
// enabled: !!storeId && isStepUpValid()

// useStampHistoryInfinite (useWallet.ts)
// InfiniteQuery: Stamp history with infinite scroll
// getNextPageParam: pageInfo.pageNumber < totalPages - 1 ? pageNumber + 1 : undefined

// useRedeemHistory (useWallet.ts)
// Query: GET /api/customer/wallet/stores/{storeId}/redeem-history
// enabled: !!storeId && isStepUpValid()

// useRedeemHistoryInfinite (useWallet.ts)
// InfiniteQuery: Redeem history with infinite scroll

// useWalletRewards (useWallet.ts)
// Query: GET /api/customer/wallet/rewards?status={status}
// enabled: isStepUpValid()

// useWalletRewardsInfinite (useWallet.ts)
// InfiniteQuery: Rewards with infinite scroll and status filter
```

### Cache Invalidation (from other features)

```typescript
// Issuance 승인 시 (useIssuance.ts)
queryClient.invalidateQueries({ queryKey: ['wallet'] })
// -> walletStampCards, stampHistory 등 모두 무효화

// Redeem 생성 시 (useRedeem.ts)
queryClient.invalidateQueries({ queryKey: ['wallet', 'rewards'] })

// Redeem 완료 시 (useRedeem.ts)
queryClient.invalidateQueries({ queryKey: ['wallet', 'rewards'] })
queryClient.invalidateQueries({ queryKey: ['wallet', 'redeemHistory'] })
```

---

## Frontend UI Structure

```
[WalletPage]
  |
  +-- [WalletHeader]
  |     |-- Customer name, nickname
  |     |-- Store context
  |
  +-- [StampCardCarousel]        (swipeable carousel)
  |     |
  |     +-- [StampCardItem] x N   (each card in carousel)
  |           |-- title
  |           |-- progressPercentage (circular/linear)
  |           |-- currentStampCount / goalStampCount
  |           |-- designJson rendering
  |           |-- store name
  |           |-- [RequestStampButton] (-> Issuance flow)
  |
  +-- [CardDetailView]            (selected card expanded)
  |     |-- Full stamp grid
  |     |-- nextRewardName, stampsToNextReward
  |     |-- expiresAt countdown
  |     |-- [Stamp History Timeline]  (StepUp required)
  |     |-- [Redeem History Timeline] (StepUp required)
  |
  +-- [Rewards Section]           (StepUp required)
        |-- Status filter tabs (ALL / AVAILABLE / REDEEMED / EXPIRED)
        |-- [WalletRewardItem] x N
        |     |-- rewardName
        |     |-- store info
        |     |-- status badge
        |     |-- expiresAt (countdown for AVAILABLE)
        |     |-- [Use Button] (-> Redeem flow, AVAILABLE only)
        |-- Infinite scroll pagination
```

---

## Related Features

| Feature | Relationship |
|---------|-------------|
| **Issuance** | 승인 시 `WalletStampCard.stampCount` 증가. Goal 도달 시 `WalletReward` 자동 발급. 캐시 무효화: `['wallet']`. |
| **Redeem** | 리워드 사용 시 `WalletReward` 상태 변경 (AVAILABLE -> REDEEMING -> REDEEMED). 캐시 무효화: `['wallet', 'rewards']`, `['wallet', 'redeemHistory']`. |
| **Migration** | 마이그레이션 승인 시 `WalletStampCard.stampCount` 증가 + `WalletReward` 발급 (Issuance와 동일 로직). |
| **StampCard** | `goalStampCount`, `rewardName`, `rewardQuantity`, `expireDays`, `designJson` 등 메타 정보 참조. |
| **StampRewardService** | 적립/마이그레이션 시 `processStampAccumulation()` 통해 카드 순환, 리워드 발급 일괄 처리. |
| **OTP** | Step-Up 토큰 발급. 히스토리, 리워드 조회 시 필수. `isStepUpValid()` 프론트엔드 유틸로 검증. |
| **Statistics** | StampEvent, RedeemEvent를 Owner 대시보드 통계에서 집계. |
