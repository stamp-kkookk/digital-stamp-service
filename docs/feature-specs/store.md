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
- 상태: DRAFT → LIVE → SUSPENDED → DELETED (Store Lifecycle v2)
- 매장은 항상 DRAFT 상태로 생성되며, Admin 승인 후 LIVE로 전이
- Soft delete: DELETED 상태로 전이 (DB에서 삭제하지 않음)
- Owner getStores는 DELETED 상태를 제외하고 반환
- 고객용 공개 API, Owner 전용 관리 API, Admin 전용 관리 API가 분리
- Kakao Place API 연동을 통한 장소 검색/등록 (placeRef)
- 모든 상태 변경은 StoreAuditLog에 기록

---

## 2. Backend Architecture

### 2.1 Package Structure

```
com.project.kkookk.store/
├── controller/
│   ├── owner/
│   │   ├── StoreApi.java              # Swagger interface (Owner 전용)
│   │   ├── StoreController.java       # REST controller
│   │   ├── PlaceSearchController.java # 카카오 장소 검색
│   │   └── dto/
│   │       ├── StoreCreateRequest.java
│   │       ├── StoreUpdateRequest.java
│   │       ├── StoreResponse.java
│   │       └── PlaceSearchResult.java
│   └── customer/
│       ├── CustomerStoreController.java  # 고객용 매장 조회
│       └── dto/
│           ├── StoreStampCardSummaryResponse.java
│           └── StampCardInfo.java
├── domain/
│   ├── Store.java                     # JPA entity (table: store)
│   ├── StoreStatus.java              # Enum: DRAFT, LIVE, SUSPENDED, DELETED
│   ├── StoreAuditLog.java            # JPA entity (table: store_audit_log)
│   ├── StoreAuditAction.java         # Enum: CREATED, APPROVED, SUSPENDED, UNSUSPENDED, DELETED, UPDATED
│   └── PerformerType.java            # Enum: OWNER, ADMIN
├── repository/
│   ├── StoreRepository.java          # JpaRepository
│   └── StoreAuditLogRepository.java  # JpaRepository
└── service/
    ├── StoreService.java             # Owner CRUD business logic
    ├── CustomerStoreService.java     # Customer-facing queries (cached)
    ├── KakaoPlaceSearchService.java  # 카카오 장소 검색 API 연동
    └── exception/
        ├── StoreNotFoundException.java
        ├── StoreInactiveException.java
        └── TerminalAccessDeniedException.java

com.project.kkookk.admin/
├── controller/
│   ├── AdminStoreApi.java            # Swagger interface (Admin 전용)
│   ├── AdminStoreController.java     # /api/admin/stores/*
│   └── dto/
│       ├── AdminStoreResponse.java
│       ├── AdminStoreStatusChangeRequest.java
│       └── StoreAuditLogResponse.java
└── service/
    └── AdminStoreService.java        # Admin 매장 관리 business logic
```

### 2.2 Entity: Store

| Column | Type | Nullable | Constraint | Description |
|--------|------|----------|------------|-------------|
| id | Long (PK) | No | AUTO_INCREMENT | 매장 식별자 |
| name | VARCHAR(100) | No | | 매장명 |
| address | VARCHAR(255) | Yes | | 매장 주소 |
| phone | VARCHAR(50) | Yes | | 매장 전화번호 |
| placeRef | VARCHAR(100) | Yes | UNIQUE | 카카오 장소 참조 ID |
| iconImageBase64 | LONGTEXT | Yes | | 매장 아이콘 이미지 (Base64) |
| description | VARCHAR(500) | Yes | | 매장 설명 |
| status | VARCHAR(20) | No | ENUM | DRAFT/LIVE/SUSPENDED/DELETED |
| owner_account_id | Long | No | FK (logical) | 소유 점주 ID |
| created_at | DATETIME | No | | BaseTimeEntity |
| updated_at | DATETIME | No | | BaseTimeEntity |

### 2.3 Entity: StoreAuditLog

| Column | Type | Nullable | Constraint | Description |
|--------|------|----------|------------|-------------|
| id | Long (PK) | No | AUTO_INCREMENT | 감사 로그 식별자 |
| store_id | Long | No | FK (logical) | 대상 매장 ID |
| action | VARCHAR(30) | No | ENUM | CREATED/APPROVED/SUSPENDED/UNSUSPENDED/DELETED/UPDATED |
| previous_status | VARCHAR(20) | Yes | ENUM | 이전 상태 |
| new_status | VARCHAR(20) | Yes | ENUM | 새 상태 |
| performed_by | Long | Yes | | 수행자 ID |
| performed_by_type | VARCHAR(20) | No | ENUM | OWNER/ADMIN |
| detail | TEXT | Yes | | 상세 설명 (예: 운영 승인 완료) |
| created_at | DATETIME(6) | No | | 생성 시각 |

### 2.4 Repository Methods

```java
// StoreRepository
List<Store> findByOwnerAccountId(Long ownerAccountId);
List<Store> findByOwnerAccountIdAndStatusNot(Long ownerAccountId, StoreStatus status);
Optional<Store> findByIdAndOwnerAccountId(Long id, Long ownerAccountId);
List<Store> findByStatus(StoreStatus status);
boolean existsByPlaceRef(String placeRef);

// StoreAuditLogRepository
List<StoreAuditLog> findByStoreIdOrderByCreatedAtDesc(Long storeId);
```

---

## 3. API Endpoints

### 3.1 Owner API (인증: OWNER JWT)

| Method | Path | Handler | Status Code | Description |
|--------|------|---------|-------------|-------------|
| POST | `/api/owner/stores` | `StoreController.createStore()` | 201 | 매장 생성 (항상 DRAFT) |
| GET | `/api/owner/stores` | `StoreController.getStores()` | 200 | 내 매장 목록 (DELETED 제외) |
| GET | `/api/owner/stores/{storeId}` | `StoreController.getStore()` | 200 | 매장 상세 |
| PUT | `/api/owner/stores/{storeId}` | `StoreController.updateStore()` | 200 | 매장 수정 |
| DELETE | `/api/owner/stores/{storeId}` | `StoreController.deleteStore()` | 204 | 매장 삭제 (→DELETED 전이) |
| GET | `/api/owner/places/search?query=xxx` | `PlaceSearchController.searchPlaces()` | 200 | 카카오 장소 검색 |

### 3.2 Admin API (인증: OWNER JWT with admin=true, ROLE_ADMIN)

| Method | Path | Handler | Status Code | Description |
|--------|------|---------|-------------|-------------|
| GET | `/api/admin/stores?status=DRAFT` | `AdminStoreController.getStores()` | 200 | 전체 매장 목록 (status 필터) |
| GET | `/api/admin/stores/{storeId}` | `AdminStoreController.getStore()` | 200 | 매장 상세 (owner 정보 포함) |
| PATCH | `/api/admin/stores/{storeId}/status` | `AdminStoreController.changeStatus()` | 200 | 매장 상태 변경 |
| GET | `/api/admin/stores/{storeId}/audit-logs` | `AdminStoreController.getAuditLogs()` | 200 | 매장 Audit Log 조회 |

### 3.3 Customer API (인증: CUSTOMER JWT 또는 Public)

| Method | Path | Handler | Status Code | Description |
|--------|------|---------|-------------|-------------|
| GET | `/api/customer/stores/{storeId}/summary` | `CustomerStoreController.getStoreSummary()` | 200 | 매장+활성 스탬프카드 요약 |

> Customer store summary는 `@Cacheable(value = "storeSummary", key = "#storeId")`로 캐시됨.

---

## 4. Sequence Diagrams

### 4.1 Owner Creates Store

```
Owner Browser          StoreController          StoreService           StoreRepository    AuditLogRepo
     |                       |                       |                       |                |
     |--POST /stores-------->|                       |                       |                |
     |  {name, address,      |                       |                       |                |
     |   phone, placeRef,    |                       |                       |                |
     |   iconImageBase64,    |                       |                       |                |
     |   description}        |                       |                       |                |
     |                       |--createStore---------->|                       |                |
     |                       |  (ownerId from JWT,    |                       |                |
     |                       |   request)             |                       |                |
     |                       |                       |--validate phone       |                |
     |                       |                       |--check placeRef dup-->|                |
     |                       |                       |--new Store(DRAFT,     |                |
     |                       |                       |   name, address,...)->|                |
     |                       |                       |--save(store)--------->|                |
     |                       |                       |<--saved entity--------|                |
     |                       |                       |--save(AuditLog:CREATED)------------>|
     |                       |<--StoreResponse--------|                       |                |
     |<--201 + body----------|                       |                       |                |
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
     |                     |                        | [status!=LIVE?]   |            |
     |                     |                        |  throw STORE_NOT_OPERATIONAL   |
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
DRAFT      -- 생성 직후, Admin 승인 대기 중. 고객 접근 불가.
LIVE       -- 정상 운영 중, 고객 접근 가능. Admin 승인 후.
SUSPENDED  -- 일시 정지, 고객 접근 차단. Admin 또는 시스템에 의해.
DELETED    -- 소프트 삭제 (최종 상태). Owner DELETE 요청 시.
```

### 5.2 State Diagram

```
   ┌─────────┐   Admin 승인     ┌─────────┐
   │  DRAFT  │ ─────────────── │  LIVE    │
   │(생성 시)│                  │(운영 중) │
   └────┬────┘                  └──┬───┬──┘
        │                          │   │
        │  Owner DELETE            │   │  Admin 정지
        │                          │   └───────────────┐
        │                          │                   │
        │                          │  Admin 복원       │
        │                   ┌──────┘              ┌────▼─────┐
        │                   │                     │ SUSPENDED │
        │                   └─────────────────────│(일시 정지)│
        │                                         └──────────┘
        │  Owner DELETE     Owner DELETE
        └─────────────────┬────────────
                          │
                          v
                   ┌──────────┐
                   │ DELETED  │  (소프트 삭제, 최종 상태)
                   └──────────┘
```

**허용 상태 전이:**
| From | To | Performer | Trigger |
|------|-----|-----------|---------|
| DRAFT | LIVE | Admin | 매장 승인 (PATCH /api/admin/stores/{id}/status) |
| DRAFT | DELETED | Owner | 매장 삭제 (DELETE /api/owner/stores/{id}) |
| LIVE | SUSPENDED | Admin | 매장 정지 |
| SUSPENDED | LIVE | Admin | 매장 복원 |
| LIVE | DELETED | Owner | 매장 삭제 |

> 잘못된 상태 전이 시도 시 `STORE_STATUS_TRANSITION_INVALID` (400) 에러 발생.
> 모든 상태 변경은 `store_audit_log` 테이블에 기록됨.

### 5.3 Customer Access Gate

```
Customer requests /api/customer/stores/{storeId}/summary
    |
    +--[Store not found?]--> 404 STORE_NOT_FOUND
    |
    +--[Store.status != LIVE?]--> 403 STORE_NOT_OPERATIONAL
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
| phone | String | No | @Size(max=50), PhoneValidator | "02-1234-5678" |
| placeRef | String | No | @Size(max=100), UNIQUE | "12345678" |
| iconImageBase64 | String | No | 크기 제한 5MB (STORE_ICON_TOO_LARGE) | "data:image/png;base64,..." |
| description | String | No | @Size(max=500) | "강남역 근처 카페" |

> `status` 필드가 제거됨. 매장은 항상 `DRAFT` 상태로 생성된다.

### 6.2 StoreUpdateRequest

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| name | String | Yes | @NotBlank, @Size(max=100) | "스타벅스 강남점" |
| address | String | No | @Size(max=255) | "서울시 강남구 테헤란로 456" |
| phone | String | No | @Size(max=50), PhoneValidator | "02-9876-5432" |
| description | String | No | @Size(max=500) | "신논현역 근처 베이커리" |
| iconImageBase64 | String | No | 크기 제한 5MB | "data:image/png;base64,..." |

> `status` 필드가 제거됨. 상태 변경은 Admin API를 통해서만 가능.

### 6.3 StoreResponse (Owner)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | Long | No | 매장 ID |
| name | String | No | 매장명 |
| address | String | Yes | 매장 주소 |
| phone | String | Yes | 매장 전화번호 |
| placeRef | String | Yes | 카카오 장소 참조 ID |
| iconImageBase64 | String | Yes | 매장 아이콘 이미지 (Base64) |
| description | String | Yes | 매장 설명 |
| status | StoreStatus | No | DRAFT/LIVE/SUSPENDED/DELETED |
| createdAt | LocalDateTime | No | 생성 시각 |
| updatedAt | LocalDateTime | No | 수정 시각 |
| ownerAccountId | Long | No | 점주 ID |

### 6.4 PlaceSearchResult

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| placeName | String | No | 장소명 |
| address | String | Yes | 지번 주소 |
| roadAddress | String | Yes | 도로명 주소 |
| phone | String | Yes | 전화번호 |
| placeUrl | String | Yes | 카카오 장소 URL |
| kakaoPlaceId | String | No | 카카오 장소 ID |

### 6.5 AdminStoreResponse

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | Long | No | 매장 ID |
| name | String | No | 매장명 |
| address | String | Yes | 매장 주소 |
| phone | String | Yes | 매장 전화번호 |
| placeRef | String | Yes | 카카오 장소 참조 ID |
| iconImageBase64 | String | Yes | 매장 아이콘 이미지 |
| description | String | Yes | 매장 설명 |
| status | StoreStatus | No | 매장 상태 |
| ownerAccountId | Long | No | 점주 ID |
| ownerName | String | Yes | 점주 이름 |
| ownerEmail | String | No | 점주 이메일 |
| ownerPhone | String | Yes | 점주 전화번호 |
| createdAt | LocalDateTime | No | 생성 시각 |
| updatedAt | LocalDateTime | No | 수정 시각 |

### 6.6 AdminStoreStatusChangeRequest

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| status | StoreStatus | Yes | @NotNull | "LIVE" |
| reason | String | No | @Size(max=500) | "심사 완료, 승인" |

### 6.7 StoreAuditLogResponse

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | Long | No | 감사 로그 ID |
| storeId | Long | No | 매장 ID |
| action | StoreAuditAction | No | CREATED/APPROVED/SUSPENDED/UNSUSPENDED/DELETED/UPDATED |
| previousStatus | StoreStatus | Yes | 이전 상태 |
| newStatus | StoreStatus | Yes | 새 상태 |
| performedBy | Long | Yes | 수행자 ID |
| performedByType | PerformerType | No | OWNER/ADMIN |
| detail | String | Yes | 상세 설명 |
| createdAt | LocalDateTime | No | 생성 시각 |

### 6.8 StoreStampCardSummaryResponse (Customer)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| storeName | String | No | 매장명 |
| stampCard | StampCardInfo | Yes | 현재 활성 스탬프 카드 (없으면 null) |

### 6.9 StampCardInfo (Nested in Summary)

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
| STORE_INACTIVE | 403 | STORE_INACTIVE | 해당 매장은 현재 이용할 수 없습니다 | (레거시) Customer accesses non-LIVE store |
| STORE_NOT_OPERATIONAL | 403 | STORE_NOT_OPERATIONAL | 매장이 운영 중이 아닙니다 | Customer accesses non-LIVE store |
| STORE_STATUS_TRANSITION_INVALID | 400 | STORE_STATUS_TRANSITION_INVALID | 유효하지 않은 매장 상태 전이입니다 | Invalid state transition (e.g., DRAFT→SUSPENDED) |
| STORE_PLACE_REF_DUPLICATED | 409 | STORE_PLACE_REF_DUPLICATED | 이미 등록된 장소입니다 | placeRef uniqueness violation |
| STORE_ICON_TOO_LARGE | 413 | STORE_ICON_TOO_LARGE | 아이콘 이미지 크기가 너무 큽니다 (최대 5MB) | Icon image exceeds 5MB limit |
| STORE_PHONE_INVALID | 400 | STORE_PHONE_INVALID | 전화번호 형식이 올바르지 않습니다 | PhoneValidator fails |
| ADMIN_ACCESS_DENIED | 403 | ADMIN_ACCESS_DENIED | 관리자 권한이 필요합니다 | Non-admin accesses /api/admin/** |
| KAKAO_API_ERROR | 500 | KAKAO_API_ERROR | 카카오 API 호출 중 오류가 발생했습니다 | KakaoPlaceSearchService fails |
| TERMINAL_ACCESS_DENIED | 403 | TERMINAL_ACCESS_DENIED | 단말기 접근 권한이 없습니다 | Terminal login for non-owned store |

---

## 8. Edge Cases

### 8.1 Cross-Owner Access Returns 404 (Not 403)

- **Scenario**: Owner A tries to access Owner B's store by guessing storeId.
- **Behavior**: `findByIdAndOwnerAccountId(storeId, ownerA_id)` returns `Optional.empty()`, resulting in `STORE_NOT_FOUND` (404).
- **Security Rationale**: Returning 403 would confirm the store exists, leaking information. Returning 404 hides the store's existence from unauthorized users.

### 8.2 Soft Delete

- **Current**: `deleteStore()` performs a state transition to DELETED (soft delete). 데이터는 DB에 유지됨.
- **Impact**: DELETED 매장은 Owner getStores에서 제외됨. 연관 데이터(stamp cards, issuance requests 등)는 보존됨.
- **Audit**: 삭제 시 StoreAuditLog에 DELETED 액션이 기록됨.

### 8.3 DRAFT Status on Creation

- **Scenario**: Owner가 매장을 생성.
- **Behavior**: `status` 필드가 StoreCreateRequest에서 제거됨. 매장은 항상 DRAFT 상태로 생성.
- **Next Step**: Admin이 심사 후 PATCH /api/admin/stores/{id}/status로 LIVE 상태로 전이.

### 8.4 placeRef Uniqueness

- **Scenario**: 두 Owner가 같은 카카오 장소를 등록 시도.
- **Behavior**: `STORE_PLACE_REF_DUPLICATED` (409) 에러 발생. placeRef는 UNIQUE 제약 조건.

### 8.5 Customer Cache Staleness

- **Scenario**: Owner deactivates store; customer still sees cached active summary.
- **Behavior**: `@Cacheable(value = "storeSummary", key = "#storeId")` caches indefinitely until evicted.
- **Mitigation**: Cache TTL configuration in `CacheConfig` should set a reasonable expiration. Cache eviction should be triggered on store status update.

### 8.6 Store Without Active Stamp Card

- **Scenario**: Customer accesses store summary but no ACTIVE stamp card exists.
- **Behavior**: `StoreStampCardSummaryResponse.stampCard` is `null`. The frontend should display an appropriate "no active card" state.

### 8.7 No Pagination on Owner Store List

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
API_ENDPOINTS.OWNER.STORES       = '/api/owner/stores'
API_ENDPOINTS.OWNER.STORE        = (storeId) => `/api/owner/stores/${storeId}`
API_ENDPOINTS.OWNER.STORE_QR     = (storeId) => `/api/owner/stores/${storeId}/qr`
API_ENDPOINTS.OWNER.PLACE_SEARCH = '/api/owner/places/search'

API_ENDPOINTS.ADMIN.STORES       = '/api/admin/stores'
API_ENDPOINTS.ADMIN.STORE        = (storeId) => `/api/admin/stores/${storeId}`
API_ENDPOINTS.ADMIN.STORE_STATUS = (storeId) => `/api/admin/stores/${storeId}/status`
API_ENDPOINTS.ADMIN.STORE_AUDIT  = (storeId) => `/api/admin/stores/${storeId}/audit-logs`

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
.requestMatchers("/api/admin/**").hasRole("ADMIN")
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
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100)  NOT NULL,
    address             VARCHAR(255)  NULL,
    phone               VARCHAR(50)   NULL,
    place_ref           VARCHAR(100)  NULL,
    icon_image_base64   LONGTEXT      NULL,
    description         VARCHAR(500)  NULL,
    status              VARCHAR(20)   NOT NULL,
    owner_account_id    BIGINT        NOT NULL,
    created_at          DATETIME(6)   NOT NULL,
    updated_at          DATETIME(6)   NOT NULL,

    UNIQUE INDEX idx_store_place_ref (place_ref),
    INDEX idx_store_owner (owner_account_id),
    INDEX idx_store_status (status)
);

CREATE TABLE store_audit_log (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id          BIGINT        NOT NULL,
    action            VARCHAR(30)   NOT NULL,
    previous_status   VARCHAR(20)   NULL,
    new_status        VARCHAR(20)   NULL,
    performed_by      BIGINT        NULL,
    performed_by_type VARCHAR(20)   NOT NULL,
    detail            TEXT          NULL,
    created_at        DATETIME(6)   NOT NULL,

    INDEX idx_sal_store (store_id),
    INDEX idx_sal_created (created_at)
);
```
