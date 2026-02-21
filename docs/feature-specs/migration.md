# Feature: Migration (스탬프 마이그레이션)

## Status: Implemented

---

## Overview

마이그레이션은 종이 스탬프 판을 디지털 스탬프로 전환하는 기능이다.
고객이 종이 스탬프 판 사진(Base64)과 주장하는 스탬프 개수를 제출하면, 매장 사장님(Owner)이 백오피스에서 이미지를 확인한 뒤 수동으로 승인/반려한다.
승인 시 사장님이 직접 스탬프 수를 입력(고객 요청 수와 다를 수 있음)하며, 스탬프 적립 + 리워드 발급이 자동 처리된다.

**OTP Step-Up 인증 필수** (고객 측 모든 API).

---

## Backend

| Layer | File Path |
|-------|-----------|
| Controller (Customer) | `backend/src/main/java/com/project/kkookk/migration/controller/CustomerMigrationController.java` |
| API Interface (Customer) | `backend/src/main/java/com/project/kkookk/migration/controller/CustomerMigrationApi.java` |
| Controller (Owner) | `backend/src/main/java/com/project/kkookk/migration/controller/OwnerMigrationController.java` |
| API Interface (Owner) | `backend/src/main/java/com/project/kkookk/migration/controller/OwnerMigrationApi.java` |
| Service (Customer) | `backend/src/main/java/com/project/kkookk/migration/service/CustomerMigrationService.java` |
| Service (Owner) | `backend/src/main/java/com/project/kkookk/migration/service/OwnerMigrationService.java` |
| Entity | `backend/src/main/java/com/project/kkookk/migration/domain/StampMigrationRequest.java` |
| Status Enum | `backend/src/main/java/com/project/kkookk/migration/domain/StampMigrationStatus.java` |
| Repository | `backend/src/main/java/com/project/kkookk/migration/repository/StampMigrationRequestRepository.java` |
| Image Validator | `backend/src/main/java/com/project/kkookk/migration/util/Base64ImageValidator.java` |

## Frontend

| Layer | File Path |
|-------|-----------|
| Feature Module | `frontend/src/features/migration/` |
| API Client | `frontend/src/features/migration/api/migrationApi.ts` |
| Customer Hooks | `frontend/src/features/migration/hooks/useMigration.ts` |
| Owner Hooks | `frontend/src/features/migration/hooks/useOwnerMigration.ts` |
| Types | `frontend/src/features/migration/types.ts` |
| Customer - Migration Form | `frontend/src/features/migration/components/customer/MigrationForm.tsx` |
| Customer - Migration List | `frontend/src/features/migration/components/customer/MigrationList.tsx` |
| Customer - Migration Detail | `frontend/src/features/migration/components/customer/MigrationDetail.tsx` |
| Admin - Migration Manager | `frontend/src/features/migration/components/admin/MigrationManager.tsx` |

---

## API Endpoints

### Customer API (Step-Up Token Required)

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| POST | `/api/customer/migrations` | `CustomerMigrationController.createMigrationRequest()` | CUSTOMER + **STEPUP** | 마이그레이션 요청 생성. Base64 이미지 + claimedStampCount 제출. |
| GET | `/api/customer/migrations/{id}` | `CustomerMigrationController.getMigrationRequest()` | CUSTOMER + **STEPUP** | 마이그레이션 요청 상태 조회. |
| GET | `/api/customer/migrations` | `CustomerMigrationController.getMyMigrationRequests()` | CUSTOMER + **STEPUP** | 내 마이그레이션 요청 목록 조회 (최신순). |

### Owner API

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| GET | `/api/owner/stores/{storeId}/migrations` | `OwnerMigrationController.getList()` | OWNER | SUBMITTED 상태 마이그레이션 요청 목록. |
| GET | `/api/owner/stores/{storeId}/migrations/{id}` | `OwnerMigrationController.getDetail()` | OWNER | 마이그레이션 요청 상세 (이미지 포함). |
| POST | `/api/owner/stores/{storeId}/migrations/{id}/approve` | `OwnerMigrationController.approve()` | OWNER | 마이그레이션 승인. approvedStampCount 입력. |
| POST | `/api/owner/stores/{storeId}/migrations/{id}/reject` | `OwnerMigrationController.reject()` | OWNER | 마이그레이션 반려. rejectReason 필수. |

---

## Business Rules

- **OTP Step-Up 필수**: 고객 측 모든 API에서 `CustomerPrincipal.isStepUp()` 검증. 미인증 시 403 `STEPUP_REQUIRED`.
- **이미지 제한**: Base64 인코딩, 최대 5MB. `Base64ImageValidator.validate()` 검증.
- **중복 방지**: 동일 `customerWalletId + storeId`에 SUBMITTED 상태 요청이 이미 존재하면 409. 승인/반려된 요청은 재신청 가능.
- **claimedStampCount**: 고객이 주장하는 개수. 백오피스에서 참고용으로 자동 완성되며, 사장님이 승인 시 `approvedStampCount`를 직접 입력 (수정 가능).
- **승인 시 처리**: `stampRewardService.processStampAccumulation()` 호출 -> 스탬프 적립 + 리워드 발급 + 카드 순환. `StampEvent(MIGRATED)` 원장 기록.
- **반려 시**: rejectReason 필수 (255자 이하). 상태만 REJECTED로 변경.
- **취소**: Entity에 `cancel()` 메서드 존재하나 현재 API로 노출되지 않음.
- **소유권 검증**: Customer는 본인 요청만 조회 가능. Owner는 본인 매장 요청만 조회/처리 가능.
- **SLA 메시지**: 응답에 `"24~48시간 이내 처리됩니다"` 포함.
- **BLOCKED 지갑 차단**: 차단된 지갑 고객은 마이그레이션 요청 불가.
- **Concurrency**: Owner 승인 시 WalletStampCard에 Pessimistic Lock 적용.

---

## Sequence Diagram

```
Customer App              Backend                    Owner Backoffice
    |                        |                            |
    | [1. OTP Step-Up]       |                            |
    |--POST /otp/request---->|                            |
    |<--OTP sent-------------|                            |
    |--POST /otp/verify----->|                            |
    |<--{stepUpToken}--------|                            |
    |                        |                            |
    | [2. Upload Photo]      |                            |
    |--POST /api/customer/   |                            |
    |  migrations            |                            |
    |  {storeId,             |                            |
    |   imageData (Base64),  |                            |
    |   claimedStampCount}   |                            |
    |  [Authorization:       |                            |
    |   Bearer stepUpToken]  |                            |
    |                        |                            |
    |                        |--Validate: StepUp          |
    |                        |--Validate: Image size      |
    |                        |  (max 5MB)                 |
    |                        |--Validate: Wallet exists   |
    |                        |--Validate: Not BLOCKED     |
    |                        |--Validate: Store exists    |
    |                        |--Validate: No SUBMITTED    |
    |                        |  for same wallet+store     |
    |                        |--Create request            |
    |                        |  (status=SUBMITTED)        |
    |                        |                            |
    |<--201 {id, SUBMITTED,  |                            |
    |     slaMessage:        |                            |
    |     "24~48시간 이내     |                            |
    |      처리됩니다"}       |                            |
    |                        |                            |
    | [3. Check Status]      |                            |
    |--GET /api/customer/    |                            |
    |  migrations/{id}       |                            |
    |<--{SUBMITTED, ...}-----|                            |
    |                        |                            |
    |                        | [4. Owner Reviews]         |
    |                        |<--GET /api/owner/stores/   |
    |                        |   {storeId}/migrations     |
    |                        |--Return SUBMITTED list---->|
    |                        |                            |
    |                        |<--GET /api/owner/stores/   |
    |                        |   {storeId}/migrations/{id}|
    |                        |--Return detail with        |
    |                        |   imageData, customerPhone,|
    |                        |   customerName,            |
    |                        |   claimedStampCount------->|
    |                        |                            |
    |                        |  [Owner reviews photo]     |
    |                        |  [Owner inputs stamp count]|
    |                        |                            |
    |                        | [5a. Approve]              |
    |                        |<--POST /approve            |
    |                        |   {approvedStampCount: 7}  |
    |                        |                            |
    |                        |--Validate: SUBMITTED       |
    |                        |--Get ACTIVE StampCard      |
    |                        |--Lock: WalletStampCard     |
    |                        |--processStampAccumulation  |
    |                        |  (stampCount += 7)         |
    |                        |--migration.approve(7)      |
    |                        |--StampEvent(MIGRATED)      |
    |                        |  delta=7                   |
    |                        |                            |
    |                        |--200 {APPROVED,            |
    |                        |   approvedStampCount: 7,   |
    |                        |   processedAt}------------>|
    |                        |                            |
    | [6. Customer Check]    |                            |
    |--GET /api/customer/    |                            |
    |  migrations/{id}       |                            |
    |<--{APPROVED,           |                            |
    |   approvedStampCount:7,|                            |
    |   processedAt}         |                            |
    |                        |                            |
    |                        | [5b. Reject (alternative)] |
    |                        |<--POST /reject             |
    |                        |   {rejectReason:           |
    |                        |    "사진이 불명확합니다"}    |
    |                        |--migration.reject(reason)  |
    |                        |--200 {REJECTED,            |
    |                        |   rejectReason,            |
    |                        |   processedAt}------------>|
```

---

## State Transitions

```
                  approve(stampCount)
  [SUBMITTED] ────────────────────────────> [APPROVED]
      |
      |           reject(reason)
      ├──────────────────────────────────> [REJECTED]
      |
      |           cancel() (entity only, no API)
      └──────────────────────────────────> [CANCELED]
```

- SUBMITTED -> APPROVED: `OwnerMigrationService.approve()` -- 스탬프 적립 + 리워드 발급 + 원장 기록
- SUBMITTED -> REJECTED: `OwnerMigrationService.reject()` -- rejectReason 기록
- SUBMITTED -> CANCELED: Entity 메서드만 존재. 현재 API 미노출.
- 승인/반려 후 재신청 가능 (동일 wallet+store에 새로운 SUBMITTED 요청 생성 가능)

---

## DTO Field Specs

### CreateMigrationRequest (Customer -> Backend)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `storeId` | Long | Yes | `@NotNull` | 매장 ID |
| `imageData` | String | Yes | `@NotBlank`, Base64, max 5MB | 종이 스탬프 판 이미지 (Base64 인코딩) |
| `claimedStampCount` | Integer | Yes | `@NotNull`, `@Min(1)` | 고객이 주장하는 스탬프 개수 |

### MigrationRequestResponse (Backend -> Customer)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | Long | No | 마이그레이션 요청 ID |
| `customerWalletId` | Long | No | 고객 지갑 ID |
| `storeId` | Long | No | 매장 ID |
| `status` | StampMigrationStatus | No | SUBMITTED / APPROVED / REJECTED / CANCELED |
| `imageData` | String | No | 종이 스탬프 판 이미지 (Base64) |
| `claimedStampCount` | Integer | No | 고객이 주장한 스탬프 개수 |
| `approvedStampCount` | Integer | Yes | 승인된 스탬프 개수 (승인 시에만) |
| `rejectReason` | String | Yes | 반려 사유 (반려 시에만) |
| `requestedAt` | LocalDateTime | No | 요청 생성 시각 |
| `processedAt` | LocalDateTime | Yes | 처리 완료 시각 (승인/반려 시) |
| `slaMessage` | String | No | "24~48시간 이내 처리됩니다" |

### MigrationListItemResponse (Backend -> Customer, 목록용)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | Long | No | 마이그레이션 요청 ID |
| `storeId` | Long | No | 매장 ID |
| `storeName` | String | No | 매장 이름 |
| `status` | StampMigrationStatus | No | 요청 상태 |
| `claimedStampCount` | Integer | No | 고객이 주장한 스탬프 개수 |
| `approvedStampCount` | Integer | Yes | 승인된 스탬프 개수 |
| `rejectReason` | String | Yes | 반려 사유 |
| `requestedAt` | LocalDateTime | No | 요청 시각 |
| `processedAt` | LocalDateTime | Yes | 처리 시각 |

> Note: 목록 조회 시 `imageData`는 제외됨 (트래픽 최적화).

### MigrationApproveRequest (Owner -> Backend)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `approvedStampCount` | Integer | Yes | `@NotNull`, `@Min(1)` | 승인할 스탬프 수 (사장님이 직접 입력) |

### MigrationApproveResponse (Backend -> Owner)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 요청 ID |
| `status` | String | "APPROVED" |
| `approvedStampCount` | Integer | 승인된 스탬프 수 |
| `processedAt` | LocalDateTime | 처리 시간 |

### MigrationRejectRequest (Owner -> Backend)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `rejectReason` | String | Yes | `@NotBlank`, `@Size(max=255)` | 반려 사유 |

### MigrationRejectResponse (Backend -> Owner)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 요청 ID |
| `status` | String | "REJECTED" |
| `rejectReason` | String | 반려 사유 |
| `processedAt` | LocalDateTime | 처리 시간 |

### MigrationDetailResponse (Backend -> Owner, 상세 조회)

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | Long | No | 요청 ID |
| `customerWalletId` | Long | No | 고객 지갑 ID |
| `customerPhone` | String | Yes | 고객 전화번호 |
| `customerName` | String | Yes | 고객 이름 |
| `imageUrl` | String | No | 이미지 (Base64 데이터 직접 반환) |
| `claimedStampCount` | Integer | No | 고객이 주장한 스탬프 수 |
| `status` | String | No | 요청 상태 |
| `approvedStampCount` | Integer | Yes | 승인된 스탬프 수 |
| `rejectReason` | String | Yes | 반려 사유 |
| `requestedAt` | LocalDateTime | No | 요청 시간 |
| `processedAt` | LocalDateTime | Yes | 처리 시간 |

### MigrationListResponse (Backend -> Owner, 목록 조회)

| Field | Type | Description |
|-------|------|-------------|
| `migrations` | List\<MigrationSummary\> | 마이그레이션 요청 목록 |

### MigrationSummary (Owner 목록 내 항목)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | 요청 ID |
| `customerPhone` | String | 고객 전화번호 |
| `customerName` | String | 고객 이름 |
| `claimedStampCount` | Integer | 고객이 주장한 스탬프 수 |
| `status` | String | 요청 상태 |
| `requestedAt` | LocalDateTime | 요청 시간 |

---

## Entity: StampMigrationRequest

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Long (PK) | AUTO_INCREMENT | 요청 ID |
| `customer_wallet_id` | Long | NOT NULL | 고객 지갑 ID |
| `store_id` | Long | NOT NULL | 매장 ID |
| `image_data` | MEDIUMTEXT | NOT NULL | 종이 스탬프 판 이미지 (Base64) |
| `claimed_stamp_count` | Integer | NOT NULL | 고객이 주장한 스탬프 개수 |
| `status` | VARCHAR(20) | NOT NULL, ENUM | SUBMITTED / APPROVED / REJECTED / CANCELED |
| `approved_stamp_count` | Integer | Nullable | 승인된 스탬프 개수 |
| `reject_reason` | VARCHAR(255) | Nullable | 반려 사유 |
| `requested_at` | DATETIME(6) | NOT NULL | 요청 시각 |
| `processed_at` | DATETIME(6) | Nullable | 처리 완료 시각 |
| `created_at` | DATETIME(6) | NOT NULL | 생성 시각 (BaseTimeEntity) |
| `modified_at` | DATETIME(6) | NOT NULL | 수정 시각 (BaseTimeEntity) |

---

## Edge Cases

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| OTP Step-Up 미인증 | 403 | `STEPUP_REQUIRED` | OTP 인증이 필요합니다 |
| 이미지 5MB 초과 | 413 | `MIGRATION_IMAGE_TOO_LARGE` | 이미지 크기가 너무 큽니다 (최대 5MB) |
| 동일 wallet+store에 SUBMITTED 요청 존재 | 409 | `MIGRATION_ALREADY_PENDING` | 이미 처리 중인 마이그레이션 요청이 있습니다 |
| 다른 고객의 마이그레이션 요청 조회 | 403 | `MIGRATION_ACCESS_DENIED` | 다른 고객의 마이그레이션 요청에 접근할 수 없습니다 |
| 존재하지 않는 마이그레이션 ID | 404 | `MIGRATION_NOT_FOUND` | 마이그레이션 요청을 찾을 수 없습니다 |
| 이미 처리된(APPROVED/REJECTED) 요청 재처리 | 409 | `MIGRATION_ALREADY_PROCESSED` | 이미 처리된 마이그레이션 요청입니다 |
| 차단된(BLOCKED) 지갑으로 요청 | 403 | `CUSTOMER_WALLET_BLOCKED` | 차단된 지갑입니다 |
| 존재하지 않는 고객 지갑 | 404 | `CUSTOMER_WALLET_NOT_FOUND` | 해당 전화번호와 이름으로 지갑을 찾을 수 없습니다 |
| 존재하지 않는 매장 | 404 | `STORE_NOT_FOUND` | 매장을 찾을 수 없습니다 |
| Owner가 타 매장 요청 처리 | 403 | `ACCESS_DENIED` | 접근 권한이 없습니다 |
| 활성 스탬프카드가 없는 매장에서 승인 | 409 | `NO_ACTIVE_STAMP_CARD` | 활성 스탬프 카드가 없습니다 |
| 고객의 ACTIVE WalletStampCard 미존재 | 404 | `WALLET_STAMP_CARD_NOT_FOUND` | 해당 지갑 스탬프카드를 찾을 수 없습니다 |

---

## TanStack Query Keys

```typescript
// frontend/src/lib/api/endpoints.ts

// Customer - 마이그레이션 요청 목록
QUERY_KEYS.migrations = () => ['customer', 'migrations'] as const

// Customer - 마이그레이션 요청 상세
QUERY_KEYS.migration = (id: number) => ['customer', 'migration', id] as const

// Owner - 매장별 마이그레이션 목록
QUERY_KEYS.storeMigrations = (storeId: number) =>
  ['owner', 'store', storeId, 'migrations'] as const

// Owner - 마이그레이션 상세
QUERY_KEYS.storeMigration = (storeId: number, migrationId: number) =>
  ['owner', 'store', storeId, 'migration', migrationId] as const
```

### Hooks

```typescript
// useCreateMigration (useMigration.ts)
// Mutation: POST /api/customer/migrations
// onSuccess: invalidateQueries(QUERY_KEYS.migrations())

// useMigrationStatus (useMigration.ts)
// Query: GET /api/customer/migrations/{id}
// enabled: !!migrationId && isStepUpValid()

// useMigrationList (useMigration.ts)
// Query: GET /api/customer/migrations
// enabled: isStepUpValid()

// useOwnerMigration (useOwnerMigration.ts)
// Owner-side hooks for list, detail, approve, reject
```

---

## Related Features

| Feature | Relationship |
|---------|-------------|
| **Wallet** | 승인 시 `WalletStampCard.stampCount` 증가, Goal 도달 시 `WalletReward` 자동 발급 |
| **StampCard** | 매장의 ACTIVE StampCard 필수. `goalStampCount` 참조하여 리워드 발급 여부 결정 |
| **StampRewardService** | `processStampAccumulation()` 통해 스탬프 적립, 리워드 발급, 카드 순환 일괄 처리 |
| **StampEvent** | 승인 시 `StampEvent(MIGRATED)` 원장 기록. `delta=approvedStampCount`, `reason="마이그레이션 승인"` |
| **OTP** | Step-Up 인증 토큰 발급. 고객 측 모든 마이그레이션 API에 필수 |
| **Issuance** | 마이그레이션과 동일하게 `StampRewardService.processStampAccumulation()` 사용 (적립 로직 공유) |
