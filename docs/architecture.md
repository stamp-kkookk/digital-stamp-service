# System Architecture

> KKOOKK 시스템 아키텍처 개요. 구조적 변경 시 이 문서도 업데이트한다.

## Overview

```
┌──────────────────┐     ┌──────────────────┐
│  Customer Mobile │     │  Owner Desktop   │
│  (React PWA)     │     │  (React SPA)     │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         └────────────────────────┘
                    │ HTTP (JSON)
                        ┌─────────▼──────────┐
                        │  Frontend (Vite)   │
                        │  port 5173         │
                        │  /api → :8080 proxy│
                        └─────────┬──────────┘
                                  │
                        ┌─────────▼──────────┐
                        │  Spring Boot API   │
                        │  port 8080         │
                        │  JWT + Security    │
                        └──┬──────────────┬──┘
                           │              │
                 ┌─────────▼──────────┐   │  ┌──────────────────┐
                 │  MySQL 8.0         │   └──│ Kakao Place API  │
                 │  port 3306         │      │ (장소 검색)       │
                 └────────────────────┘      └──────────────────┘
```

## Authentication (OAuth 전용)

### JWT 토큰 2종 + Refresh

| 토큰 | Claims | TTL | 발급 경로 |
|------|--------|-----|----------|
| OWNER | `sub: ownerId, email, type: OWNER` | 1시간 | OAuth 로그인/가입 |
| ADMIN | `sub: ownerId, email, admin: true, type: OWNER` | 1시간 | OAuth 로그인 (admin 계정) |
| CUSTOMER | `sub: walletId, type: CUSTOMER` | 1시간 | OAuth 로그인/가입 |
| Refresh Token | `userId, type` | 7일 | OAuth 로그인/가입 시 발급 |

### 인증 흐름 (OAuth)

```
1. Frontend → OAuth Provider (Google/Kakao/Naver) 인증
2. Provider → Frontend 콜백 (authorization code)
3. Frontend → POST /api/public/oauth/login {provider, code, redirectUri, role}
4. Backend → Provider API로 사용자 정보 조회
5. OAuthAccount 조회/생성 → JWT + Refresh Token 발급
```

```
Request → JwtAuthenticationFilter
           ├─ Extract Bearer token
           ├─ Validate signature + expiry
           ├─ Parse TokenType (OWNER/CUSTOMER)
           └─ Create Principal (OwnerPrincipal / CustomerPrincipal)
               └─ Set SecurityContext
```

### Principal 타입

| Principal | Fields | Roles |
|-----------|--------|-------|
| CustomerPrincipal | `walletId` | `ROLE_CUSTOMER` |
| OwnerPrincipal | `ownerId`, `email`, `admin` | `ROLE_OWNER`, `ROLE_ADMIN` (조건부: admin=true) |

### Security URL Patterns

```
/api/auth/refresh    → PERMIT_ALL (토큰 갱신)
/api/public/**       → PERMIT_ALL (OAuth, 지갑 체크, 매장 공개)
/api/customer/**     → hasRole("CUSTOMER")
/api/admin/**        → hasRole("ADMIN")
/api/owner/**        → hasRole("OWNER")
```

## Domain Relationships

```
OAuthAccount (dual-link)
 ├─ customerWalletId (nullable) → CustomerWallet
 └─ ownerAccountId (nullable) → OwnerAccount

OwnerAccount (admin: boolean)
 └─ Store (1:N)
     ├─ placeRef, iconImageBase64, category, description
     ├─ StampCard (1:N, max 1 ACTIVE per Store)
     │   └─ designType: COLOR | IMAGE | PUZZLE
     ├─ StoreAuditLog (1:N) - 상태 변경 이력
     ├─ IssuanceRequest (via WalletStampCard)
     └─ StampMigration (via WalletStampCard)

CustomerWallet
 └─ WalletStampCard (1:N, per Store)
     ├─ stampCount, goalStampCount
     ├─ StampEvent (1:N) - 적립 이력
     └─ WalletReward (1:N) - 자동 발급된 리워드
         └─ RedeemEvent (1:N) - 사용 이력
```

### 주요 상태 Enum

| Enum | 값 | 전이 |
|------|---|------|
| StampCardStatus | `DRAFT → ACTIVE → PAUSED → ARCHIVED` | ARCHIVED는 최종 상태 |
| IssuanceRequestStatus | `PENDING → APPROVED / REJECTED / EXPIRED` | 120s TTL |
| StampMigrationStatus | `SUBMITTED → APPROVED / REJECTED / CANCELED` | 수동 승인 |
| WalletRewardStatus | `AVAILABLE → REDEEMED / EXPIRED` | 리워드 라이프사이클 |
| WalletStampCardStatus | `ACTIVE → COMPLETED` | 목표 도달 시 완료 |
| StoreStatus | `DRAFT → LIVE → SUSPENDED → DELETED` | DRAFT: 생성 직후, Admin 승인→LIVE, LIVE↔SUSPENDED, DELETED: 소프트 삭제(최종) |

## Core Flows

### 1. Issuance (적립)

```
Customer                Backend                Owner 백오피스
   │                       │                       │
   ├─POST /issuance-requests─>│                    │
   │ (walletStampCardId,    │                       │
   │  idempotencyKey)       │                       │
   │                        ├─Create PENDING────────>│
   │                        │ (TTL: 120s)           │
   │<─201 {id, PENDING}────│                       │
   │                        │                       │
   │ [폴링 시작: 2-3s 간격]  │                       │
   ├─GET /issuance-requests/{id}─>│                │
   │<─{status: PENDING}────│                       │
   │                        │                       │
   │                        │  Owner 폴링            │
   │                        │<─GET /pending-requests─┤
   │                        ├─Return list───────────>│
   │                        │                       │
   │                        │<─POST /approve────────┤
   │                        ├─stampCount++          │
   │                        ├─Create StampEvent     │
   │                        ├─Check Goal (Auto Reward)│
   │                        │                       │
   ├─GET /issuance-requests/{id}─>│                │
   │<─{status: APPROVED}───│                       │
   │ [폴링 종료]             │                       │
```

### 2. Redeem (리딤)

```
Customer                Backend
   │                       │
   │ [리워드 정보 표시]       │
   │ [사장님 확인 모달]       │
   │ "되돌릴 수 없는 작업"    │
   │ 사장님/직원 확인 후      │
   │                        │
   ├─POST /redeems─────────>│
   │ (walletRewardId)       ├─Reward→REDEEMED
   │                        ├─Create RedeemEvent
   │<─200 {redeemed}───────│
```

### 3. Migration (마이그레이션)

```
Customer                Backend                Owner
   │                       │                       │
   │                        │                       │
   ├─POST /migrations─────>│                       │
   │ (Base64 이미지,         │                       │
   │  walletStampCardId)    ├─Save image           │
   │                        ├─Create SUBMITTED──────>│
   │<─201 {id, SUBMITTED}──│                       │
   │                        │                       │
   │                        │ Owner 백오피스         │
   │                        │<─GET /migrations──────┤
   │                        ├─Return SUBMITTED list─>│
   │                        │                       │
   │                        │<─POST /approve────────┤
   │                        │ (stampCount: N)        │
   │                        ├─stampCount += N        │
   │                        ├─Create StampEvent(MIGRATED)│
   │                        ├─Check Goal (Auto Reward)│
   │                        │                       │
   ├─GET /migrations/{id}─>│                       │
   │<─{status: APPROVED}───│                       │
```

## Error Handling Chain

```
Controller (@Valid request)
    │
    ├─ Validation failure → MethodArgumentNotValidException
    │                        → 400 + field errors
    │
    └─ Service call
        │
        ├─ BusinessException(ErrorCode.XXX)
        │   → GlobalExceptionHandler
        │   → ErrorResponse { code, message, timestamp }
        │
        └─ Unexpected Exception
            → GlobalExceptionHandler
            → 500 + INTERNAL_SERVER_ERROR
```

### ErrorCode 카테고리

| 카테고리 | 예시 | HTTP |
|---------|------|------|
| Common | INVALID_INPUT_VALUE, INTERNAL_SERVER_ERROR | 400, 500 |
| Auth | UNAUTHORIZED, ACCESS_DENIED | 401, 403 |
| StampCard | STAMP_CARD_NOT_FOUND, STAMP_CARD_ALREADY_ACTIVE | 404, 409 |
| Store | STORE_NOT_FOUND, STORE_INACTIVE, STORE_NOT_OPERATIONAL, STORE_STATUS_TRANSITION_INVALID, STORE_PLACE_REF_DUPLICATED, STORE_ICON_TOO_LARGE, STORE_PHONE_INVALID | 404, 403, 409, 400, 413 |
| Admin | ADMIN_ACCESS_DENIED | 403 |
| External | KAKAO_API_ERROR | 500 |
| Issuance | ISSUANCE_REQUEST_NOT_FOUND, ISSUANCE_REQUEST_EXPIRED | 404, 410 |
| OAuth | OAUTH_CODE_EXCHANGE_FAILED, OAUTH_USERINFO_FAILED, OAUTH_INVALID_TEMP_TOKEN | 502, 401 |
| Wallet | CUSTOMER_WALLET_NOT_FOUND, CUSTOMER_WALLET_BLOCKED | 404, 403 |
| Redeem | REWARD_NOT_FOUND, REWARD_EXPIRED | 404, 410 |
| Migration | MIGRATION_NOT_FOUND, MIGRATION_IMAGE_TOO_LARGE | 404, 413 |

## Feature Package Convention

```
backend/src/main/java/com/project/kkookk/
├── global/              # 공통 설정, 보안, 예외, 유틸
│   ├── config/          # SecurityConfig, JpaAuditingConfig, CacheConfig, SpringDocConfig
│   ├── dto/             # PageResponse, ErrorResponse
│   ├── entity/          # BaseTimeEntity
│   ├── exception/       # ErrorCode, BusinessException, GlobalExceptionHandler
│   ├── security/        # JwtAuthenticationFilter, *Principal
│   └── util/            # JwtUtil, PhoneValidator
├── admin/               # 관리자 (매장 승인/정지, Audit Log)
├── issuance/            # 적립 요청/승인
├── migration/           # 종이 스탬프 이전
├── oauth/               # OAuth 인증 (Google, Kakao, Naver)
├── owner/               # 사장님 계정
├── qrcode/              # QR 코드 생성
├── redeem/              # 리워드 사용
├── stamp/               # 스탬프 이벤트 기록
├── stampcard/           # 스탬프카드 설계/관리
├── statistics/          # 통계
├── store/               # 매장
└── wallet/              # 고객 지갑
```

## Frontend Architecture

### Routing

```
/customer/*          → 고객 지갑 (모바일 퍼스트)
/owner/*             → 사장님 백오피스 (데스크톱 퍼스트, 적립 승인 포함)
/admin/*             → 관리자 (매장 승인/관리, 데스크톱)
/stores/:storeId/customer → QR 스캔 진입 (로그인 전)
```

### Component Pattern

```
Page (라우트 레벨)
 └─ Container (데이터 fetch + 상태 관리)
     └─ View (프레젠테이션, Tailwind 스타일링)
```

### State Management

| 영역 | 도구 | 용도 |
|------|------|------|
| Server State | TanStack Query v5 | API 캐싱, 자동 refetch |
| Auth State | React Context + localStorage | 토큰, 사용자 정보 |
| Form State | React Hook Form + Zod | 폼 유효성 검사 |

### API Client (frontend/src/lib/api/)

```
client.ts        → Axios 인스턴스 (getRaw, postRaw, putRaw, patchRaw, delRaw)
endpoints.ts     → API_ENDPOINTS (URL 상수) + QUERY_KEYS (캐시 키 팩토리)
tokenManager.ts  → Auth 토큰 관리 (localStorage)
```
