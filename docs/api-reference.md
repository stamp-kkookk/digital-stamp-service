# API Reference

> KKOOKK 전체 API 엔드포인트 카탈로그. API 추가/수정 시 이 문서도 업데이트한다.

## 인증 정보

| 토큰 유형 | 발급 경로 | 용도 | TTL |
|-----------|----------|------|-----|
| JWT (Customer) | OAuth 로그인 | `/api/customer/**` 엔드포인트 | 1시간 |
| JWT (Owner) | OAuth 로그인 | `/api/owner/**` 엔드포인트 | 1시간 |
| JWT (Admin) | OAuth 로그인 (admin=true) | `/api/admin/**` 엔드포인트 | 1시간 |
| Refresh Token | OAuth 로그인/가입 시 발급 | JWT 갱신 | 7일 |

### Security URL Patterns (SecurityConfig.java)

```
/api/auth/refresh            → PERMIT_ALL
/api/public/**               → PERMIT_ALL (OAuth, 지갑 체크, 매장)
/api/customer/**             → hasRole("CUSTOMER")
/api/admin/**                → hasRole("ADMIN")
/api/owner/**                → hasRole("OWNER")
/swagger-ui/**, /v3/api-docs/** → PERMIT_ALL
```

## 공통 에러 응답 포맷

```json
{
  "code": "STAMP_CARD_NOT_FOUND",
  "message": "스탬프 카드를 찾을 수 없습니다",
  "timestamp": "2025-01-15T10:30:00",
  "errors": [{ "field": "name", "message": "필수 입력입니다" }]
}
```

| HTTP | 의미 | 사용 시점 |
|------|------|----------|
| 200 | OK | 성공 GET/POST/PUT/PATCH |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 유효성 검증 실패 |
| 401 | Unauthorized | 토큰 없음/만료/불일치 |
| 403 | Forbidden | 권한 부족, 지갑 차단 |
| 404 | Not Found | 리소스 미존재 |
| 409 | Conflict | 중복 데이터, 상태 충돌 |
| 410 | Gone | TTL 만료 (적립/리딤 요청) |
| 413 | Payload Too Large | 이미지 5MB 초과 |

---

## Public API (인증 불필요)

### OAuth 인증

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/public/oauth/login` | `OAuthController.login()` | OAuth 로그인 (Google/Kakao/Naver). 기존 사용자면 JWT 발급, 신규면 tempToken 발급 |
| POST | `/api/public/oauth/complete-customer-signup` | `OAuthController.completeCustomerSignup()` | OAuth 고객 가입 완료 (이름, 닉네임, 전화번호) |
| POST | `/api/public/oauth/complete-owner-signup` | `OAuthController.completeOwnerSignup()` | OAuth 사장님 가입 완료 (이름, 닉네임, 전화번호) |
| POST | `/api/auth/refresh` | `RefreshTokenController.refresh()` | Refresh 토큰으로 Access 토큰 갱신 |

### Customer 지갑 체크

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/public/wallet/check-nickname?nickname={nickname}` | `WalletController.checkNickname()` | 닉네임 중복 체크 |
| GET | `/api/public/wallet/check-phone?phone={phone}` | `WalletController.checkPhone()` | 전화번호 중복 체크 |

### 공개 매장 정보

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/public/stores` | `StorePublicController.getAllActiveStores()` | LIVE 매장 전체 목록 |
| GET | `/api/public/stores/{storeId}` | `StorePublicController.getStorePublicInfo()` | 매장 공개 정보 (QR 스캔 진입 화면) |

---

## Customer API (Bearer accessToken, ROLE_CUSTOMER)

### 적립 (Issuance)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/customer/issuance-requests` | `CustomerIssuanceController.createIssuanceRequest()` | 적립 요청 생성 (TTL: 120s, idempotent key) |
| GET | `/api/customer/issuance-requests/{id}` | `CustomerIssuanceController.getIssuanceRequest()` | 적립 요청 상태 조회 (폴링용, 2-3초 간격) |
| POST | `/api/customer/issuance-requests/{id}/cancel` | `CustomerIssuanceController.cancelIssuanceRequest()` | 적립 요청 취소 (PENDING만 가능, 409 on conflict) |

### 리딤 (Redeem)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/customer/redeems` | `CustomerRedeemController.redeemReward()` | 리워드 즉시 사용 |

### 마이그레이션 (Migration)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/customer/migrations` | `CustomerMigrationController.createMigrationRequest()` | 종이 스탬프 이전 요청 (Base64 이미지, 최대 5MB) |
| GET | `/api/customer/migrations/{id}` | `CustomerMigrationController.getMigrationRequest()` | 마이그레이션 요청 상세 조회 |
| GET | `/api/customer/migrations` | `CustomerMigrationController.getMyMigrationRequests()` | 내 마이그레이션 요청 목록 |

### 지갑 (Wallet)

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/customer/wallet/my-stamp-cards` | `CustomerWalletController.getMyStampCards()` | 내 스탬프카드 목록 |

### 지갑 히스토리

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/customer/wallet/stores/{storeId}/stamp-history` | `CustomerWalletController.getStampHistory()` | 스탬프 적립 이력 (페이지네이션) |
| GET | `/api/customer/wallet/stores/{storeId}/redeem-history` | `CustomerWalletController.getRedeemHistory()` | 리딤 사용 이력 (페이지네이션) |

### 리워드

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/customer/wallet/rewards` | `CustomerWalletController.getRewards()` | 리워드/쿠폰함 (페이지네이션, status 필터) |

---

## Owner API (Bearer ownerAccessToken, ROLE_OWNER)

### 매장 관리

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/owner/stores` | `StoreController.createStore()` | 매장 생성 (항상 DRAFT 상태로 생성, Admin 승인 후 LIVE) |
| GET | `/api/owner/stores` | `StoreController.getStores()` | 소유 매장 목록 (DELETED 제외) |
| GET | `/api/owner/stores/{storeId}` | `StoreController.getStore()` | 매장 상세 |
| PUT | `/api/owner/stores/{storeId}` | `StoreController.updateStore()` | 매장 정보 수정 (LIVE: description/icon만 가능, STORE_UPDATE_NOT_ALLOWED) |
| DELETE | `/api/owner/stores/{storeId}` | `StoreController.deleteStore()` | 매장 삭제 (Soft delete → DELETED 상태 전이) |

### 장소 검색

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/owner/places/search?query=xxx` | `PlaceSearchController.searchPlaces()` | 카카오 장소 검색 (매장 등록 시 placeRef 연동) |

### 스탬프카드 관리

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/owner/stores/{storeId}/stamp-cards` | `StampCardController.create()` | 스탬프카드 생성 (초기: DRAFT) |
| GET | `/api/owner/stores/{storeId}/stamp-cards` | `StampCardController.getList()` | 스탬프카드 목록 (페이지네이션, status 필터) |
| GET | `/api/owner/stores/{storeId}/stamp-cards/{id}` | `StampCardController.getById()` | 스탬프카드 상세 |
| PUT | `/api/owner/stores/{storeId}/stamp-cards/{id}` | `StampCardController.update()` | 스탬프카드 수정 (발급된 카드는 수정 불가) |
| PATCH | `/api/owner/stores/{storeId}/stamp-cards/{id}/status` | `StampCardController.updateStatus()` | 상태 변경 (매장당 ACTIVE 1개 제한) |
| DELETE | `/api/owner/stores/{storeId}/stamp-cards/{id}` | `StampCardController.delete()` | 삭제 (DRAFT 상태만) |

### 마이그레이션 처리

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/owner/stores/{storeId}/migrations` | `OwnerMigrationController.getList()` | 마이그레이션 요청 목록 (SUBMITTED 상태) |
| GET | `/api/owner/stores/{storeId}/migrations/{id}` | `OwnerMigrationController.getDetail()` | 마이그레이션 요청 상세 (이미지 포함) |
| POST | `/api/owner/stores/{storeId}/migrations/{id}/approve` | `OwnerMigrationController.approve()` | 승인 + 스탬프 수 반영 |
| POST | `/api/owner/stores/{storeId}/migrations/{id}/reject` | `OwnerMigrationController.reject()` | 거절 (사유 포함) |

### 통계 & 이벤트

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/owner/stores/{storeId}/statistics` | `OwnerStatisticsController.getStoreStatistics()` | 매장 통계 (기간별, 기본 30일) |
| GET | `/api/owner/stores/{storeId}/stamp-events` | `OwnerStampEventController.getStampEvents()` | 스탬프 적립 이벤트 이력 (페이지네이션) |
| GET | `/api/owner/stores/{storeId}/redeem-events` | `OwnerRedeemEventController.getRedeemEvents()` | 리딤 완료 이벤트 이력 (페이지네이션) |

### 적립 승인

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/owner/stores/{storeId}/issuance-requests` | `OwnerApprovalController.getPendingRequests()` | 대기 중 적립 요청 목록 (폴링) |
| POST | `/api/owner/stores/{storeId}/issuance-requests/{id}/approve` | `OwnerApprovalController.approveRequest()` | 적립 승인 (스탬프 + 원장 생성) |
| POST | `/api/owner/stores/{storeId}/issuance-requests/{id}/reject` | `OwnerApprovalController.rejectRequest()` | 적립 거절 |

---

## Admin API (Bearer ownerAccessToken with admin=true, ROLE_ADMIN)

### 매장 관리

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/admin/stores?status=DRAFT` | `AdminStoreController.getStores()` | 전체 매장 목록 (status 필터 가능) |
| GET | `/api/admin/stores/{storeId}` | `AdminStoreController.getStore()` | 매장 상세 (owner 정보 포함) |
| PATCH | `/api/admin/stores/{storeId}/status` | `AdminStoreController.changeStatus()` | 매장 상태 변경 (DRAFT→LIVE 승인, LIVE→SUSPENDED 정지 등) |
| GET | `/api/admin/stores/{storeId}/audit-logs` | `AdminStoreController.getAuditLogs()` | 매장 Audit Log 조회 |

