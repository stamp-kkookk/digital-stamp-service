# Feature: Store (매장)

> Owner가 매장을 등록/관리하고, 고객이 매장 정보를 조회하는 도메인.
> StampCard, Terminal, Statistics 등 대부분의 기능이 Store에 종속된다.

## Status: Implemented

---

## 1. Overview

매장(Store)은 KKOOKK 플랫폼의 중심 엔티티로, 1개의 Owner가 여러 매장을 소유할 수 있다.
매장에는 스탬프 카드, 터미널 로그인, 통계, 적립/리딤 등 모든 비즈니스 기능이 연결된다.

**핵심 원칙:**
- 1 Owner : N Stores (owner_account_id FK)
- 소유권 검증: `findByIdAndOwnerAccountId()` - 타인의 매장 접근 시 404 반환 (403 아닌 404로 정보 은닉)
- 상태: ACTIVE, INACTIVE, DELETED (soft delete 용도)
- 고객용 공개 API와 Owner 전용 관리 API가 분리

---

## 2. Backend Architecture

### 2.1 Package Structure

```
com.project.kkookk.store/
├── controller/
│   ├── owner/
│   │   ├── StoreApi.java              # Swagger interface (Owner 전용)
│   │   ├── StoreController.java       # REST controller
│   │   └── dto/
│   │       ├── StoreCreateRequest.java
│   │       ├── StoreUpdateRequest.java
│   │       └── StoreResponse.java
│   └── customer/
│       ├── CustomerStoreController.java  # 고객용 매장 조회
│       └── dto/
│           ├── StoreStampCardSummaryResponse.java
│           └── StampCardInfo.java
├── domain/
│   ├── Store.java                     # JPA entity (table: store)
│   └── StoreStatus.java              # Enum: ACTIVE, INACTIVE, DELETED
├── repository/
│   └── StoreRepository.java          # JpaRepository
└── service/
    ├── StoreService.java             # Owner CRUD business logic
    ├── CustomerStoreService.java     # Customer-facing queries (cached)
    └── exception/
        ├── StoreNotFoundException.java
        ├── StoreInactiveException.java
        └── TerminalAccessDeniedException.java
```

### 2.2 Entity: Store

| Column | Type | Nullable | Constraint | Description |
|--------|------|----------|------------|-------------|
| id | Long (PK) | No | AUTO_INCREMENT | 매장 식별자 |
| name | VARCHAR(100) | No | | 매장명 |
| address | VARCHAR(255) | Yes | | 매장 주소 |
| phone | VARCHAR(50) | Yes | | 매장 전화번호 |
| status | VARCHAR(20) | No | ENUM | ACTIVE/INACTIVE/DELETED |
| owner_account_id | Long | No | FK (logical) | 소유 점주 ID |
| created_at | DATETIME | No | | BaseTimeEntity |
| updated_at | DATETIME | No | | BaseTimeEntity |

### 2.3 Repository Methods

```java
List<Store> findByOwnerAccountId(Long ownerAccountId);
Optional<Store> findByIdAndOwnerAccountId(Long id, Long ownerAccountId);
List<Store> findByStatus(StoreStatus status);
```

---

## 3. API Endpoints

### 3.1 Owner API (인증: OWNER JWT)

| Method | Path | Handler | Status Code | Description |
|--------|------|---------|-------------|-------------|
| POST | `/api/owner/stores` | `StoreController.createStore()` | 201 | 매장 생성 |
| GET | `/api/owner/stores` | `StoreController.getStores()` | 200 | 내 매장 목록 |
| GET | `/api/owner/stores/{storeId}` | `StoreController.getStore()` | 200 | 매장 상세 |
| PUT | `/api/owner/stores/{storeId}` | `StoreController.updateStore()` | 200 | 매장 수정 |
| DELETE | `/api/owner/stores/{storeId}` | `StoreController.deleteStore()` | 204 | 매장 삭제 |

### 3.2 Customer API (인증: CUSTOMER JWT 또는 Public)

| Method | Path | Handler | Status Code | Description |
|--------|------|---------|-------------|-------------|
| GET | `/api/customer/stores/{storeId}/summary` | `CustomerStoreController.getStoreSummary()` | 200 | 매장+활성 스탬프카드 요약 |

> Customer store summary는 `@Cacheable(value = "storeSummary", key = "#storeId")`로 캐시됨.

---

## 4. Sequence Diagrams

### 4.1 Owner Creates Store

```
Owner Browser          StoreController          StoreService           StoreRepository
     |                       |                       |                       |
     |--POST /stores-------->|                       |                       |
     |  {name, address,      |                       |                       |
     |   phone, status}      |                       |                       |
     |                       |--createStore---------->|                       |
     |                       |  (ownerId from JWT,    |                       |
     |                       |   request)             |                       |
     |                       |                       |--new Store(name,      |
     |                       |                       |   address, phone,     |
     |                       |                       |   status, ownerId)--->|
     |                       |                       |--save(store)--------->|
     |                       |                       |<--saved entity--------|
     |                       |<--StoreResponse--------|                       |
     |<--201 + body----------|                       |                       |
```

### 4.2 Owner Gets Store (Ownership Verified)

```
Owner Browser          StoreController          StoreService           StoreRepository
     |                       |                       |                       |
     |--GET /stores/{id}---->|                       |                       |
     |                       |--getStore(ownerId,---->|                       |
     |                       |   storeId)            |                       |
     |                       |                       |--findByIdAndOwner---->|
     |                       |                       |  AccountId(storeId,   |
     |                       |                       |  ownerId)             |
     |                       |                       |<--Optional<Store>-----|
     |                       |                       |                       |
     |                       |                       | [empty?]              |
     |                       |                       |  throw BusinessException
     |                       |                       |  (STORE_NOT_FOUND)    |
     |                       |                       |                       |
     |                       |                       | [present?]            |
     |                       |<--StoreResponse--------|                       |
     |<--200 + body----------|                       |                       |
```

### 4.3 Customer Gets Store Summary (Cached)

```
Customer App       CustomerStoreController   CustomerStoreService   StoreRepo  StampCardRepo
     |                     |                        |                   |            |
     |--GET /stores/{id}/  |                        |                   |            |
     |    summary--------->|                        |                   |            |
     |                     |--getStoreStampCard---->|                   |            |
     |                     |  Summary(storeId)      |                   |            |
     |                     |                        | [check cache]     |            |
     |                     |                        | [miss]            |            |
     |                     |                        |--findById-------->|            |
     |                     |                        |<--Store-----------|            |
     |                     |                        |                   |            |
     |                     |                        | [status!=ACTIVE?] |            |
     |                     |                        |  throw STORE_INACTIVE          |
     |                     |                        |                   |            |
     |                     |                        |--findFirstByStore |            |
     |                     |                        |  IdAndStatusOrder |            |
     |                     |                        |  ByCreatedAtDesc->|----------->|
     |                     |                        |<--Optional<Card>--|            |
     |                     |                        |                   |            |
     |                     |                        |--build response   |            |
     |                     |                        |  (storeName +     |            |
     |                     |                        |   stampCardInfo)   |            |
     |                     |                        | [store in cache]  |            |
     |                     |<--StoreStampCard--------|                   |            |
     |                     |  SummaryResponse        |                   |            |
     |<--200 + body--------|                        |                   |            |
```

---

## 5. State Transitions

### 5.1 StoreStatus Enum

```
ACTIVE    -- 정상 운영 중, 고객 접근 가능
INACTIVE  -- 일시 중단, 고객 접근 차단 (STORE_INACTIVE 에러)
DELETED   -- 소프트 삭제 (향후 구현 예정)
```

### 5.2 State Diagram

```
    +----------+       update(status=INACTIVE)      +------------+
    |  ACTIVE  | ---------------------------------> |  INACTIVE   |
    |          | <--------------------------------- |             |
    +----+-----+       update(status=ACTIVE)        +------+-----+
         |                                                 |
         |           update(status=DELETED)                |
         +----------------------+--------------------------+
                                |
                                v
                         +----------+
                         |  DELETED |  (soft delete, final)
                         +----------+
```

> **Note**: Current implementation uses `storeRepository.delete()` (hard delete) for the
> DELETE endpoint. The DELETED status exists in the enum for future soft-delete migration.

### 5.3 Customer Access Gate

```
Customer requests /api/customer/stores/{storeId}/summary
    |
    +--[Store not found?]--> 404 STORE_NOT_FOUND
    |
    +--[Store.status != ACTIVE?]--> 403 STORE_INACTIVE
    |
    +--[OK]--> Return StoreStampCardSummaryResponse
```

---

## 6. DTO Field Specifications

### 6.1 StoreCreateRequest

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| name | String | Yes | @NotBlank, @Size(max=100) | "스타벅스 강남점" |
| address | String | No | @Size(max=255) | "서울시 강남구 테헤란로 123" |
| phone | String | No | @Size(max=50) | "02-1234-5678" |
| status | StoreStatus | Yes | @NotNull, Enum | "ACTIVE" |

### 6.2 StoreUpdateRequest

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| name | String | Yes | @NotBlank, @Size(max=100) | "스타벅스 강남점" |
| address | String | No | @Size(max=255) | "서울시 강남구 테헤란로 456" |
| phone | String | No | @Size(max=50) | "02-9876-5432" |
| status | StoreStatus | Yes | @NotNull, Enum | "ACTIVE" |

### 6.3 StoreResponse (Owner)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | Long | No | 매장 ID |
| name | String | No | 매장명 |
| address | String | Yes | 매장 주소 |
| phone | String | Yes | 매장 전화번호 |
| status | StoreStatus | No | ACTIVE/INACTIVE/DELETED |
| createdAt | LocalDateTime | No | 생성 시각 |
| updatedAt | LocalDateTime | No | 수정 시각 |
| ownerAccountId | Long | No | 점주 ID |

### 6.4 StoreStampCardSummaryResponse (Customer)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| storeName | String | No | 매장명 |
| stampCard | StampCardInfo | Yes | 현재 활성 스탬프 카드 (없으면 null) |

### 6.5 StampCardInfo (Nested in Summary)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| stampCardId | Long | No | 스탬프 카드 ID |
| title | String | No | 카드 이름 |
| rewardName | String | Yes | 리워드 명 |
| goalStampCount | Integer | No | 목표 스탬프 수 |
| designJson | String | Yes | 디자인 JSON |

---

## 7. Error Codes

| ErrorCode | HTTP Status | Code String | Korean Message | Trigger |
|-----------|-------------|-------------|----------------|---------|
| STORE_NOT_FOUND | 404 | STORE_NOT_FOUND | 매장을 찾을 수 없습니다 | findByIdAndOwnerAccountId returns empty, OR findById returns empty for customer |
| STORE_INACTIVE | 403 | STORE_INACTIVE | 해당 매장은 현재 이용할 수 없습니다 | Customer accesses non-ACTIVE store |
| TERMINAL_ACCESS_DENIED | 403 | TERMINAL_ACCESS_DENIED | 단말기 접근 권한이 없습니다 | Terminal login for non-owned store |

---

## 8. Edge Cases

### 8.1 Cross-Owner Access Returns 404 (Not 403)

- **Scenario**: Owner A tries to access Owner B's store by guessing storeId.
- **Behavior**: `findByIdAndOwnerAccountId(storeId, ownerA_id)` returns `Optional.empty()`, resulting in `STORE_NOT_FOUND` (404).
- **Security Rationale**: Returning 403 would confirm the store exists, leaking information. Returning 404 hides the store's existence from unauthorized users.

### 8.2 Hard Delete vs Soft Delete

- **Current**: `storeRepository.delete()` performs a hard DELETE from the database.
- **Impact**: All associated stamp cards, issuance requests, redeem sessions, and statistics data may become orphaned. No cascading delete is configured at the JPA level.
- **Future**: Planned migration to soft delete using DELETED status + `@Where` annotation.

### 8.3 Creating Store with DELETED Status

- **Scenario**: Owner sends `{ "status": "DELETED" }` in StoreCreateRequest.
- **Behavior**: Currently allowed by validation (only `@NotNull`). The store is created with DELETED status immediately.
- **Risk**: Low impact, but a validation enhancement to restrict initial status to ACTIVE/INACTIVE is recommended.

### 8.4 Customer Cache Staleness

- **Scenario**: Owner deactivates store; customer still sees cached active summary.
- **Behavior**: `@Cacheable(value = "storeSummary", key = "#storeId")` caches indefinitely until evicted.
- **Mitigation**: Cache TTL configuration in `CacheConfig` should set a reasonable expiration. Cache eviction should be triggered on store status update.

### 8.5 Store Without Active Stamp Card

- **Scenario**: Customer accesses store summary but no ACTIVE stamp card exists.
- **Behavior**: `StoreStampCardSummaryResponse.stampCard` is `null`. The frontend should display an appropriate "no active card" state.

### 8.6 No Pagination on Owner Store List

- **Scenario**: Owner has many stores.
- **Behavior**: `getStores()` returns `List<StoreResponse>` (no pagination). For MVP with typical single-digit store counts per owner, this is acceptable.

---

## 9. Frontend Integration

### 9.1 TanStack Query Keys

```typescript
// Owner store list
QUERY_KEYS.stores = () => ['owner', 'stores'] as const

// Owner single store
QUERY_KEYS.store = (storeId: number) => ['owner', 'store', storeId] as const

// Owner store QR code
QUERY_KEYS.storeQr = (storeId: number) => ['owner', 'store', storeId, 'qr'] as const

// Customer store summary (public)
QUERY_KEYS.storeSummary = (storeId: number) =>
  ['customer', 'store', storeId, 'summary'] as const

// Public store info
QUERY_KEYS.storePublicInfo = (storeId: number) =>
  ['public', 'store', storeId] as const
```

### 9.2 API Endpoints (Frontend)

```typescript
API_ENDPOINTS.OWNER.STORES     = '/api/owner/stores'
API_ENDPOINTS.OWNER.STORE      = (storeId) => `/api/owner/stores/${storeId}`
API_ENDPOINTS.OWNER.STORE_QR   = (storeId) => `/api/owner/stores/${storeId}/qr`

API_ENDPOINTS.CUSTOMER.STORE_SUMMARY = (storeId) =>
  `/api/customer/stores/${storeId}/summary`

API_ENDPOINTS.PUBLIC.STORE_INFO = (storeId) => `/api/public/stores/${storeId}`
API_ENDPOINTS.PUBLIC.STORES     = '/api/public/stores'
```

### 9.3 Cache Invalidation Strategy

| Mutation | Invalidated Keys |
|----------|-----------------|
| Create store | `stores()` |
| Update store | `stores()`, `store(storeId)`, `storeSummary(storeId)` |
| Delete store | `stores()` |

---

## 10. Security Configuration

### 10.1 URL Authorization Rules (SecurityConfig)

```java
.requestMatchers("/api/owner/**").hasRole("OWNER")
.requestMatchers("/api/customer/**").hasRole("CUSTOMER")
.requestMatchers("/api/terminal/**").hasRole("TERMINAL")
.requestMatchers("/api/public/**").permitAll()
```

### 10.2 Owner Principal Extraction

```java
@AuthenticationPrincipal OwnerPrincipal principal
// principal.getOwnerId() -> used for findByIdAndOwnerAccountId
```

---

## 11. Related Features

| Feature | Relationship |
|---------|-------------|
| **StampCard** | Stamp cards belong to a store (store_id FK). Only ACTIVE stores can have usable stamp cards. |
| **Terminal Login** | Terminal JWT includes storeId claim. Login verifies store ownership. |
| **Issuance** | Stamp issuance requests are scoped to a store. |
| **Redeem** | Reward redemption sessions are scoped to a store. |
| **Statistics** | Per-store aggregation of stamp events, redeem events, active users. |
| **Migration** | Migration requests are filed per store. |
| **QR Code** | Each store gets a unique QR code for customer onboarding (qr/ package). |
| **Customer Wallet** | When a customer logs in via a store's QR, a WalletStampCard is auto-created for that store. |

---

## 12. Database Table DDL (Reference)

```sql
CREATE TABLE store (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(100)  NOT NULL,
    address           VARCHAR(255)  NULL,
    phone             VARCHAR(50)   NULL,
    status            VARCHAR(20)   NOT NULL,
    owner_account_id  BIGINT        NOT NULL,
    created_at        DATETIME(6)   NOT NULL,
    updated_at        DATETIME(6)   NOT NULL,

    INDEX idx_store_owner (owner_account_id),
    INDEX idx_store_status (status)
);
```
