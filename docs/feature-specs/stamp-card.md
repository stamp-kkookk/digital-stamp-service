# Feature: Stamp Card (스탬프 카드)

> Owner가 매장별 스탬프 카드를 생성/관리하는 핵심 도메인.
> 고객의 적립, 리딤, 지갑 기능의 기반이 되는 엔티티.

## Status: Implemented

---

## 1. Overview

스탬프 카드는 매장(Store)에 종속되며, Owner가 백오피스에서 CRUD 및 상태 전이를 수행한다.
카드는 DRAFT -> ACTIVE -> PAUSED -> ARCHIVED 라이프사이클을 따르며,
**매장당 ACTIVE 카드는 반드시 1개**만 존재할 수 있다.

---

## 2. Backend Architecture

### 2.1 Package Structure

```
com.project.kkookk.stampcard/
├── controller/
│   ├── StampCardApi.java            # Swagger interface (Tag, Operation, ApiResponses)
│   ├── StampCardController.java     # REST controller (implements StampCardApi)
│   └── dto/
│       ├── CreateStampCardRequest.java
│       ├── UpdateStampCardRequest.java
│       ├── UpdateStampCardStatusRequest.java
│       ├── StampCardResponse.java
│       ├── StampCardSummary.java
│       └── StampCardListResponse.java
├── domain/
│   ├── StampCard.java               # JPA entity (table: stamp_cards)
│   ├── StampCardStatus.java         # Enum with transition rules
│   └── StampCardDesignType.java     # Enum: COLOR, IMAGE, PUZZLE
├── repository/
│   └── StampCardRepository.java     # JpaRepository with custom finders
└── service/
    ├── StampCardService.java        # Business logic
    └── exception/
        ├── StampCardAlreadyActiveException.java
        ├── StampCardDeleteNotAllowedException.java
        ├── StampCardNotFoundException.java
        ├── StampCardStatusInvalidException.java
        └── StampCardUpdateNotAllowedException.java
```

### 2.2 Entity: StampCard

| Column | Type | Nullable | Constraint | Description |
|--------|------|----------|------------|-------------|
| id | Long (PK) | No | AUTO_INCREMENT | 식별자 |
| store_id | Long | No | FK (logical) | 소속 매장 ID |
| title | VARCHAR(100) | No | | 카드 이름 |
| status | VARCHAR(20) | No | ENUM | DRAFT/ACTIVE/PAUSED/ARCHIVED |
| goal_stamp_count | INT | No | 1-50 | 목표 스탬프 수 |
| required_stamps | INT | Yes | 1-50 | 리워드 달성 기준 스탬프 수 |
| reward_name | VARCHAR(255) | Yes | | 리워드 명 |
| reward_quantity | INT | Yes | min 1 | 리워드 수량 |
| expire_days | INT | Yes | min 1 | 리워드 유효기간(일) |
| design_type | VARCHAR(20) | No | ENUM | COLOR/IMAGE/PUZZLE |
| design_json | MEDIUMTEXT | Yes | JSON | 디자인 커스터마이징 데이터 |
| created_at | DATETIME | No | | BaseTimeEntity |
| updated_at | DATETIME | No | | BaseTimeEntity |

### 2.3 Repository Methods

```java
Optional<StampCard> findByIdAndStoreId(Long id, Long storeId);
Page<StampCard> findByStoreId(Long storeId, Pageable pageable);
Page<StampCard> findByStoreIdAndStatus(Long storeId, StampCardStatus status, Pageable pageable);
boolean existsByStoreIdAndStatus(Long storeId, StampCardStatus status);
Optional<StampCard> findFirstByStoreIdAndStatusOrderByCreatedAtDesc(Long storeId, StampCardStatus status);
int countByStoreIdAndStatus(Long storeId, StampCardStatus status);
```

---

## 3. API Endpoints

| Method | Path | Handler | Auth | Status Code | Description |
|--------|------|---------|------|-------------|-------------|
| POST | `/api/owner/stores/{storeId}/stamp-cards` | `create()` | OWNER | 201 | 생성 (초기: DRAFT) |
| GET | `/api/owner/stores/{storeId}/stamp-cards` | `getList()` | OWNER | 200 | 목록 (페이지네이션, status 필터) |
| GET | `/api/owner/stores/{storeId}/stamp-cards/{id}` | `getById()` | OWNER | 200 | 상세 |
| PUT | `/api/owner/stores/{storeId}/stamp-cards/{id}` | `update()` | OWNER | 200 | 수정 (ACTIVE: 제한적) |
| PATCH | `/api/owner/stores/{storeId}/stamp-cards/{id}/status` | `updateStatus()` | OWNER | 200 | 상태 변경 |
| DELETE | `/api/owner/stores/{storeId}/stamp-cards/{id}` | `delete()` | OWNER | 204 | 삭제 (DRAFT만) |

### 3.1 Pagination Defaults

- `size=20`, `sort=createdAt`, `direction=DESC`
- Optional query param: `status` (DRAFT, ACTIVE, PAUSED, ARCHIVED)

---

## 4. Sequence Diagrams

### 4.1 Create Stamp Card

```
Owner Browser          StampCardController       StampCardService       StampCardRepository
     |                        |                        |                        |
     |--POST /stamp-cards---->|                        |                        |
     |                        |--create(storeId, req)->|                        |
     |                        |                        |--build StampCard------>|
     |                        |                        |  (status=DRAFT)        |
     |                        |                        |--save(stampCard)------->|
     |                        |                        |<--saved entity----------|
     |                        |<--StampCardResponse----|                        |
     |<--201 + body-----------|                        |                        |
```

### 4.2 Status Transition (e.g., DRAFT -> ACTIVE)

```
Owner Browser          StampCardController       StampCardService       StampCardRepository
     |                        |                        |                        |
     |--PATCH /{id}/status--->|                        |                        |
     |  {status: "ACTIVE"}    |                        |                        |
     |                        |--updateStatus()------->|                        |
     |                        |                        |--findByIdAndStoreId--->|
     |                        |                        |<--StampCard------------|
     |                        |                        |                        |
     |                        |                        |--canTransitionTo()?----|
     |                        |                        |  DRAFT -> ACTIVE = OK  |
     |                        |                        |                        |
     |                        |                        |--existsByStoreIdAnd--->|
     |                        |                        |  Status(ACTIVE)?       |
     |                        |                        |<--false (no conflict)--|
     |                        |                        |                        |
     |                        |                        |--stampCard.updateStatus(ACTIVE)
     |                        |                        |  (dirty checking)      |
     |                        |<--StampCardResponse----|                        |
     |<--200 + body-----------|                        |                        |
```

### 4.3 Update (ACTIVE Card - Partial)

```
Owner Browser          StampCardController       StampCardService       StampCardRepository
     |                        |                        |                        |
     |--PUT /{id}------------>|                        |                        |
     |  {title, designJson,   |                        |                        |
     |   goalStampCount, ...} |                        |                        |
     |                        |--update()------------->|                        |
     |                        |                        |--findByIdAndStoreId--->|
     |                        |                        |<--StampCard------------|
     |                        |                        |                        |
     |                        |                        |--isActive() = true     |
     |                        |                        |--updatePartial(title,  |
     |                        |                        |   designType,          |
     |                        |                        |   designJson)          |
     |                        |                        |  (goalStampCount 등    |
     |                        |                        |   무시됨!)              |
     |                        |<--StampCardResponse----|                        |
     |<--200 + body-----------|                        |                        |
```

---

## 5. State Transitions

### 5.1 Transition Matrix

| From \ To | DRAFT | ACTIVE | PAUSED | ARCHIVED |
|-----------|-------|--------|--------|----------|
| **DRAFT** | - | OK | - | OK |
| **ACTIVE** | - | - | OK | OK |
| **PAUSED** | - | OK | - | OK |
| **ARCHIVED** | - | - | - | - |

### 5.2 State Machine Diagram

```
                 +----------------------------------+
                 |           DRAFT                  |
                 |  - Fully editable                |
                 |  - Deletable                     |
                 +-------+----------------+---------+
                         |                |
                   activate()         archive()
                         |                |
                         v                v
                 +-----------+     +------------+
                 |  ACTIVE   |     |  ARCHIVED  |
                 | - Limited |     |  (Final)   |
                 |   edit    |     |  Read-only |
                 +--+----+--+     +------------+
                    |    |              ^  ^
              pause()  archive()        |  |
                    |    |              |  |
                    |    +--------------+  |
                    v                      |
                 +-----------+             |
                 |  PAUSED   |             |
                 | - Fully   |             |
                 |   editable|             |
                 +--+----+---+             |
                    |    |                 |
             activate()  archive()         |
                    |    +-----------------+
                    v
                  ACTIVE
```

### 5.3 Transition Logic (StampCardStatus.java)

```java
ALLOWED_FROM_DRAFT  = Set.of(ACTIVE, ARCHIVED)
ALLOWED_FROM_ACTIVE = Set.of(PAUSED, ARCHIVED)
ALLOWED_FROM_PAUSED = Set.of(ACTIVE, ARCHIVED)
ARCHIVED -> (nothing)  // terminal state, canTransitionTo() always returns false
```

### 5.4 Editability Rules by Status

| Status | Full Edit | Partial Edit (title + designType + designJson) | Delete |
|--------|-----------|------------------------------------------------|--------|
| DRAFT | Yes | N/A | Yes |
| ACTIVE | No | Yes | No |
| PAUSED | Yes | N/A | No |
| ARCHIVED | No | No | No |

---

## 6. DTO Field Specifications

### 6.1 CreateStampCardRequest

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| title | String | Yes | @NotBlank, @Size(max=100) | "커피 스탬프 카드" |
| goalStampCount | Integer | Yes | @NotNull, @Min(1), @Max(50) | 10 |
| requiredStamps | Integer | No | @Min(1), @Max(50) | 10 |
| rewardName | String | No | @Size(max=255) | "아메리카노 1잔 무료" |
| rewardQuantity | Integer | No | @Min(1) | 1 |
| expireDays | Integer | No | @Min(1) | 30 |
| designType | StampCardDesignType | No | Enum (default: COLOR) | "COLOR" |
| designJson | String | No | Free-form JSON | `{"theme":"coffee","color":"#8B4513"}` |

### 6.2 UpdateStampCardRequest

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| title | String | Yes | @NotBlank, @Size(max=100) | "커피 스탬프 카드" |
| goalStampCount | Integer | Yes | @NotNull, @Min(1), @Max(50) | 10 |
| requiredStamps | Integer | No | @Min(1), @Max(50) | 10 |
| rewardName | String | No | @Size(max=255) | "아메리카노 1잔 무료" |
| rewardQuantity | Integer | No | @Min(1) | 1 |
| expireDays | Integer | No | @Min(1) | 30 |
| designType | StampCardDesignType | No | Enum | "COLOR" |
| designJson | String | No | Free-form JSON | `{"theme":"coffee","color":"#8B4513"}` |

> **Note**: When the card is ACTIVE, only `title`, `designType`, and `designJson` are applied.
> All other fields in the request body are **silently ignored**.

### 6.3 UpdateStampCardStatusRequest

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| status | StampCardStatus | Yes | @NotNull, Enum | "ACTIVE" |

### 6.4 StampCardResponse (Full Detail)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | Long | No | 스탬프 카드 ID |
| title | String | No | 카드 이름 |
| status | StampCardStatus | No | DRAFT/ACTIVE/PAUSED/ARCHIVED |
| goalStampCount | Integer | No | 목표 스탬프 수 |
| requiredStamps | Integer | Yes | 리워드 달성 기준 스탬프 수 |
| rewardName | String | Yes | 리워드 명 |
| rewardQuantity | Integer | Yes | 리워드 수량 |
| expireDays | Integer | Yes | 리워드 유효기간(일) |
| designType | StampCardDesignType | No | COLOR/IMAGE/PUZZLE |
| designJson | String | Yes | 디자인 커스터마이징 JSON |
| storeId | Long | No | 소속 매장 ID |
| createdAt | LocalDateTime | No | 생성 시각 |
| updatedAt | LocalDateTime | No | 수정 시각 |

### 6.5 StampCardSummary (List Item)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | Long | No | 스탬프 카드 ID |
| title | String | No | 카드 이름 |
| status | StampCardStatus | No | 상태 |
| goalStampCount | Integer | No | 목표 스탬프 수 |
| rewardName | String | Yes | 리워드 명 |
| designType | StampCardDesignType | No | 디자인 타입 |
| createdAt | LocalDateTime | No | 생성 시각 |

### 6.6 StampCardListResponse (Paginated)

| Field | Type | Description |
|-------|------|-------------|
| content | List\<StampCardSummary\> | 카드 목록 |
| page.number | int | 현재 페이지 번호 (0-based) |
| page.size | int | 페이지 크기 |
| page.totalElements | long | 전체 요소 수 |
| page.totalPages | int | 전체 페이지 수 |

---

## 7. Design Types

### 7.1 StampCardDesignType Enum

| Value | Description | designJson Example |
|-------|-------------|-------------------|
| COLOR | 기본형 (컬러 선택형) | `{"theme":"coffee","primaryColor":"#8B4513","bgColor":"#FFF8F0"}` |
| IMAGE | 이미지형 (업로드형) | `{"backgroundUrl":"https://...","stampIconUrl":"https://..."}` |
| PUZZLE | 퍼즐형 (특수형, 그리드 2x2 ~ 5x4) | `{"rows":3,"cols":3,"pieces":["url1","url2",...]}` |

---

## 8. Error Codes

| ErrorCode | HTTP Status | Code String | Korean Message | Trigger |
|-----------|-------------|-------------|----------------|---------|
| STAMP_CARD_NOT_FOUND | 404 | STAMP_CARD_NOT_FOUND | 스탬프 카드를 찾을 수 없습니다 | findByIdAndStoreId returns empty |
| STAMP_CARD_ALREADY_ACTIVE | 409 | STAMP_CARD_ALREADY_ACTIVE | 이미 활성화된 스탬프 카드가 존재합니다 | Activating when another card is ACTIVE |
| STAMP_CARD_STATUS_INVALID | 400 | STAMP_CARD_STATUS_INVALID | 유효하지 않은 상태 전이입니다 | canTransitionTo() returns false |
| STAMP_CARD_DELETE_NOT_ALLOWED | 400 | STAMP_CARD_DELETE_NOT_ALLOWED | 초안 상태의 스탬프 카드만 삭제할 수 있습니다 | Deleting non-DRAFT card |
| STAMP_CARD_UPDATE_NOT_ALLOWED | 400 | STAMP_CARD_UPDATE_NOT_ALLOWED | 활성 상태에서는 일부 필드만 수정할 수 있습니다 | Updating ARCHIVED card |
| STAMP_CARD_ACCESS_DENIED | 403 | STAMP_CARD_ACCESS_DENIED | 해당 스탬프 카드에 대한 접근 권한이 없습니다 | Cross-store access attempt |

---

## 9. Edge Cases

### 9.1 Concurrent ACTIVE Activation
- **Scenario**: Two requests simultaneously try to activate cards in the same store.
- **Behavior**: `existsByStoreIdAndStatus(storeId, ACTIVE)` check prevents the second one. No DB-level unique constraint; relies on application-level check within `@Transactional`.
- **Risk**: Under extreme concurrency, a race condition is theoretically possible. For MVP, this is accepted.

### 9.2 ACTIVE Card Partial Update Silently Ignores Fields
- **Scenario**: Owner sends `goalStampCount=20` for an ACTIVE card.
- **Behavior**: The service calls `updatePartial()` which only applies `title`, `designType`, and `designJson`. The `goalStampCount` change is **silently ignored** (no error thrown).
- **Frontend Mitigation**: The design studio UI should disable those fields when card is ACTIVE.

### 9.3 Self-Transition Rejection
- **Scenario**: PATCH status with the same current status (e.g., ACTIVE -> ACTIVE).
- **Behavior**: `canTransitionTo()` returns `false` when `this == target`, throwing `StampCardStatusInvalidException`.

### 9.4 ARCHIVED Is Terminal
- **Scenario**: Attempt to transition from ARCHIVED to any other status.
- **Behavior**: Always rejected. ARCHIVED cards are preserved for historical statistics.

### 9.5 Store Ownership Not Verified at StampCard Level
- **Scenario**: The `StampCardController` does not verify that the authenticated Owner actually owns the store.
- **Impact**: Any authenticated OWNER can access any store's stamp cards by guessing storeId.
- **Mitigation**: Planned future enhancement to add ownership verification.

### 9.6 Delete Cascade
- **Scenario**: Deleting a DRAFT card that may already have references (e.g., if wallet stamp cards were created before activation).
- **Behavior**: Currently uses `stampCardRepository.delete()` (hard delete). Only DRAFT cards can be deleted, minimizing referential integrity issues.

---

## 10. Frontend Integration

### 10.1 Feature Directory

```
frontend/src/features/stampcard/
```

### 10.2 Key Components
- **StampCardCreationPage**: Multi-step form for creating stamp cards
- **DesignStudioPanel**: Visual card designer (COLOR/IMAGE/PUZZLE mode switcher)
- **PreviewPanel**: Live preview of stamp card appearance
- **RulesPanel**: goalStampCount, rewardName, rewardQuantity, expireDays settings

### 10.3 Hooks
- `useStampCardCreation`: Manages multi-step form state and submission

---

## 11. TanStack Query Keys

```typescript
// List (with optional status filter)
QUERY_KEYS.stampCards = (storeId: number, status?: string) =>
  ['owner', 'store', storeId, 'stampCards', { status }] as const

// Single detail
QUERY_KEYS.stampCard = (storeId: number, stampCardId: number) =>
  ['owner', 'store', storeId, 'stampCard', stampCardId] as const
```

### 11.1 API Endpoints (Frontend)

```typescript
API_ENDPOINTS.OWNER.STAMP_CARDS = (storeId) =>
  `/api/owner/stores/${storeId}/stamp-cards`

API_ENDPOINTS.OWNER.STAMP_CARD = (storeId, stampCardId) =>
  `/api/owner/stores/${storeId}/stamp-cards/${stampCardId}`

API_ENDPOINTS.OWNER.STAMP_CARD_STATUS = (storeId, stampCardId) =>
  `/api/owner/stores/${storeId}/stamp-cards/${stampCardId}/status`
```

### 11.2 Cache Invalidation Strategy

| Mutation | Invalidated Keys |
|----------|-----------------|
| Create stamp card | `stampCards(storeId)` |
| Update stamp card | `stampCards(storeId)`, `stampCard(storeId, id)` |
| Update status | `stampCards(storeId)`, `stampCard(storeId, id)` |
| Delete stamp card | `stampCards(storeId)` |

---

## 12. Related Features

| Feature | Relationship |
|---------|-------------|
| **Store** | StampCard belongs to a Store (store_id FK) |
| **Issuance** | Active card determines stamp issuance target |
| **Wallet (WalletStampCard)** | Tracks per-customer stamp progress against a stamp card |
| **Redeem** | Reward config (rewardName, rewardQuantity, expireDays) drives redemption |
| **Migration** | Paper stamps migrated into active stamp card's count |
| **Statistics** | Stamp events aggregated per stamp card for reporting |
| **Customer Store** | `CustomerStoreService` serves the active stamp card info to customers via `/api/customer/stores/{storeId}/summary` (cached) |

---

## 13. Database Table DDL (Reference)

```sql
CREATE TABLE stamp_cards (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id    BIGINT       NOT NULL,
    title       VARCHAR(100) NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    goal_stamp_count INT     NOT NULL,
    required_stamps  INT     NULL,
    reward_name VARCHAR(255) NULL,
    reward_quantity INT      NULL,
    expire_days INT          NULL,
    design_type VARCHAR(20)  NOT NULL,
    design_json MEDIUMTEXT   NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,

    INDEX idx_stamp_cards_store_id (store_id),
    INDEX idx_stamp_cards_store_status (store_id, status)
);
```
