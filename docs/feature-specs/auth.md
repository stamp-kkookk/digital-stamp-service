# Feature: Auth (인증) - OAuth 전용

> KKOOKK 플랫폼의 2가지 사용자 유형(Owner, Customer)에 대한 OAuth 기반 인증 체계.
> Google/Kakao/Naver 소셜 로그인을 사용하며, JWT + Refresh Token으로 세션을 관리한다.
> 하나의 소셜 계정으로 Customer + Owner 모두 등록 가능 (Dual Role).

## Status: Implemented

---

## 1. Overview

KKOOKK은 2가지 토큰 타입을 사용하여 역할 기반 접근 제어를 구현한다:

| Token Type | Role | Subject | Purpose |
|------------|------|---------|---------|
| OWNER | ROLE_OWNER | ownerId | 점주 백오피스 전체 접근 |
| OWNER (admin) | ROLE_OWNER + ROLE_ADMIN | ownerId | 관리자 기능 (매장 승인/정지, Audit Log) |
| CUSTOMER | ROLE_CUSTOMER | walletId | 고객 지갑, 적립 요청, 내역 조회, 리딤, 마이그레이션 |

> 이전 StepUp 토큰은 제거됨. OAuth 로그인 자체가 본인 인증이므로 민감 API도 일반 토큰으로 접근.

---

## 2. Backend Architecture

### 2.1 Package Structure

```
com.project.kkookk/
├── oauth/
│   ├── controller/
│   │   ├── OAuthController.java          # /api/public/oauth/*
│   │   └── dto/
│   │       ├── OAuthLoginRequest.java
│   │       ├── OAuthLoginResponse.java
│   │       ├── CompleteCustomerSignupRequest.java
│   │       └── CompleteOwnerSignupRequest.java
│   ├── domain/
│   │   ├── OAuthAccount.java             # Entity (dual-link: customerWalletId + ownerAccountId)
│   │   └── OAuthProvider.java            # Enum: GOOGLE, KAKAO, NAVER
│   ├── repository/
│   │   └── OAuthAccountRepository.java
│   └── service/
│       ├── OAuthService.java
│       ├── OAuthProviderClient.java      # Interface
│       ├── GoogleOAuthClient.java
│       ├── KakaoOAuthClient.java
│       └── NaverOAuthClient.java
│
├── owner/
│   ├── domain/
│   │   └── OwnerAccount.java             # Entity (passwordHash nullable for OAuth)
│   └── repository/
│       └── OwnerAccountRepository.java
│
├── wallet/
│   ├── controller/
│   │   ├── WalletApi.java                # Swagger interface (check-nickname, check-phone only)
│   │   └── WalletController.java
│   └── service/
│       └── CustomerWalletService.java    # checkNicknameAvailable, checkPhoneAvailable
│
└── global/
    ├── config/
    │   └── SecurityConfig.java
    ├── security/
    │   ├── JwtAuthenticationFilter.java
    │   ├── TokenType.java                # Enum: OWNER, CUSTOMER
    │   ├── RefreshTokenService.java
    │   ├── OwnerPrincipal.java
    │   └── CustomerPrincipal.java
    └── util/
        └── JwtUtil.java
```

---

## 3. OAuth Login Flow

### 3.1 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/public/oauth/login` | Public | OAuth 로그인 (3사 지원) |
| POST | `/api/public/oauth/complete-customer-signup` | Public | OAuth 고객 가입 완료 |
| POST | `/api/public/oauth/complete-owner-signup` | Public | OAuth 사장님 가입 완료 |
| POST | `/api/auth/refresh` | Public | Refresh 토큰으로 갱신 |
| GET | `/api/public/wallet/check-nickname` | Public | 닉네임 중복 체크 |
| GET | `/api/public/wallet/check-phone` | Public | 전화번호 중복 체크 |

### 3.2 OAuth Login Sequence (기존 사용자)

```
Frontend                   OAuthController        OAuthService          OAuthProviderClient
   |                            |                      |                       |
   |--POST /oauth/login-------->|                      |                       |
   | {provider, code,           |                      |                       |
   |  redirectUri, role,        |                      |                       |
   |  storeId?}                 |--login(request)----->|                       |
   |                            |                      |--getUserInfo(code)--->|
   |                            |                      |<--OAuthUserInfo-------|
   |                            |                      |                       |
   |                            |                      |--findByProvider+Id--->|
   |                            |                      |<--OAuthAccount--------|
   |                            |                      |                       |
   |                            |                      | [기존 사용자 + 해당 역할 등록됨]
   |                            |                      |--generateToken()      |
   |                            |                      |                       |
   |                            |<--{isNewUser:false,--|                       |
   |                            |   accessToken,       |                       |
   |<--200 {tokens, userInfo}---|   refreshToken,...}  |                       |
```

### 3.3 OAuth Login Sequence (신규 사용자)

```
Frontend                   OAuthController        OAuthService
   |                            |                      |
   |--POST /oauth/login-------->|                      |
   |                            |--login(request)----->|
   |                            |                      | [OAuthAccount 미존재]
   |                            |                      |--generateTempToken()
   |<--200 {isNewUser: true,    |                      |
   |   tempToken, oauthName,    |<--OAuthLoginResponse-|
   |   oauthEmail}              |                      |
   |                            |                      |
   | [사용자 추가 정보 입력 폼 표시] |                      |
   |                            |                      |
   |--POST /complete-*-signup-->|                      |
   | {tempToken, name,          |--completeSignup()--->|
   |  nickname, phone}          |                      |
   |                            |                      |--validateTempToken()
   |                            |                      |--createAccount()
   |                            |                      |--linkOAuth()
   |                            |                      |--generateTokens()
   |<--200 {tokens, userInfo}---|<--OAuthLoginResponse-|
```

### 3.4 Cross-Role Flow (Dual Role)

하나의 소셜 계정으로 Customer + Owner 모두 등록 가능:

```
1. Google 계정으로 Customer 가입 → OAuthAccount.customerWalletId 설정
2. 같은 Google 계정으로 Owner 로그인 시도
   → OAuthAccount 존재하나 ownerAccountId == null
   → isNewUser: true + tempToken 반환
3. Owner 추가 정보 입력 → completeOwnerSignup
   → OwnerAccount 생성 + OAuthAccount.ownerAccountId 설정
```

### 3.5 기존 계정 연결

OAuth 가입 시 이메일(Owner) 또는 전화번호(Customer)로 기존 계정이 존재하면 자동 연결:
- Owner: `ownerAccountRepository.findByEmail(email)` → 있으면 기존 계정에 OAuth 링크
- Customer: `customerWalletRepository.findByPhone(phone)` → 있으면 기존 지갑에 OAuth 링크

---

## 4. OAuthLoginRequest DTO

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| provider | OAuthProvider (GOOGLE/KAKAO/NAVER) | Yes | OAuth 제공자 |
| code | String | Yes | Authorization code |
| redirectUri | String | Yes | 클라이언트 리다이렉트 URI |
| role | String (CUSTOMER/OWNER) | Yes | 로그인 역할 |
| storeId | Long | No | QR 스캔 시 매장 ID |

## 5. OAuthLoginResponse DTO

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| isNewUser | boolean | No | 신규 사용자 여부 |
| tempToken | String | Yes | 가입 완료용 임시 토큰 (신규만) |
| oauthName | String | Yes | OAuth 계정 이름 (신규만) |
| oauthEmail | String | Yes | OAuth 계정 이메일 (신규만) |
| accessToken | String | Yes | JWT 토큰 (기존만) |
| refreshToken | String | Yes | Refresh 토큰 (기존만) |
| id | Long | Yes | walletId(Customer) 또는 ownerId(Owner) |
| name | String | Yes | 사용자 이름 |
| nickname | String | Yes | 닉네임 |
| email | String | Yes | 이메일 (Owner만) |
| phone | String | Yes | 전화번호 (Customer만) |

---

## 6. JWT Infrastructure

### 6.1 Token Types and Claims

| Token Type | Subject (sub) | Claims | TTL |
|------------|--------------|--------|-----|
| OWNER | ownerId | type=OWNER, email, admin | 1시간 |
| CUSTOMER | walletId | type=CUSTOMER | 1시간 |
| Refresh | userId | type, role | 7일 |
| Temp | - | purpose, provider, providerId, role | 10분 |

### 6.2 Security URL Patterns

| URL Pattern | Required Role |
|-------------|--------------|
| `/api/auth/refresh` | permitAll |
| `/api/public/**` | permitAll |
| `/api/customer/**` | ROLE_CUSTOMER |
| `/api/admin/**` | ROLE_ADMIN |
| `/api/owner/**` | ROLE_OWNER |

---

## 7. OAuthAccount Entity (Flyway V5)

```sql
CREATE TABLE oauth_account (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider           VARCHAR(20)  NOT NULL,
    provider_id        VARCHAR(255) NOT NULL,
    email              VARCHAR(255),
    name               VARCHAR(100),
    customer_wallet_id BIGINT,
    owner_account_id   BIGINT,
    created_at         DATETIME(6)  NOT NULL,
    updated_at         DATETIME(6)  NOT NULL,
    UNIQUE INDEX idx_oauth_provider_id (provider, provider_id)
);
```

- `customer_wallet_id`: nullable, Customer 연결 시 설정
- `owner_account_id`: nullable, Owner 연결 시 설정
- Dual-link: 두 필드 모두 설정 가능 (Dual Role)

---

## 8. Error Codes (Auth 관련)

| ErrorCode | HTTP | Message |
|-----------|------|---------|
| OAUTH_CODE_EXCHANGE_FAILED | 502 | OAuth 인가 코드 교환 실패 |
| OAUTH_USERINFO_FAILED | 502 | OAuth 사용자 정보 조회 실패 |
| OAUTH_INVALID_TEMP_TOKEN | 401 | 유효하지 않은 임시 토큰 |
| OAUTH_OWNER_NOT_FOUND | 404 | 사장님 계정 미등록 |
| WALLET_PHONE_DUPLICATED | 409 | 전화번호 중복 |
| WALLET_NICKNAME_DUPLICATED | 409 | 닉네임 중복 |
| REFRESH_TOKEN_INVALID | 401 | 유효하지 않은 리프레시 토큰 |
| REFRESH_TOKEN_EXPIRED | 401 | 리프레시 토큰 만료 |

---

## 9. Frontend Integration

### 9.1 Feature Directory

```
frontend/src/features/auth/
├── api/
│   ├── authApi.ts              # checkNickname, checkPhone, getStorePublicInfo
│   └── oauthApi.ts             # oauthLogin, completeCustomerSignup, completeOwnerSignup
├── components/
│   ├── OAuthButtons.tsx        # OAuth 제공자 선택 버튼 (Google/Kakao/Naver)
│   ├── OAuthCallbackPage.tsx   # OAuth 콜백 처리 (/oauth/callback)
│   └── OAuthCompleteSignupForm.tsx  # 2단계 가입 폼 (이름, 닉네임, 전화번호)
├── hooks/
│   ├── useAuth.ts              # useStorePublicInfo, useLogout
│   └── useOAuth.ts             # useOAuthLogin, useOAuthCompleteCustomerSignup, useOAuthCompleteOwnerSignup
├── utils/
│   └── oauthUrl.ts             # OAuth URL 빌더, 세션 상태 관리
├── pages/
│   └── OwnerLoginPage.tsx      # Owner 로그인 + OAuth 가입 페이지
├── types.ts
└── index.ts
```

### 9.2 OAuth Flow (Frontend)

```
1. OAuthButtons → 사용자가 Google/Kakao/Naver 클릭
   → sessionStorage에 role, storeId 저장
   → OAuth 제공자 인증 페이지로 리다이렉트

2. OAuthCallbackPage (/oauth/callback)
   → authorization code 추출
   → oauthLogin API 호출
   → 기존 사용자: 토큰 저장 → 대시보드 이동
   → 신규 사용자: tempToken과 함께 가입 폼으로 이동

3. OAuthCompleteSignupForm
   → 이름, 닉네임, 전화번호 입력
   → 실시간 닉네임/전화번호 중복 체크
   → completeCustomerSignup 또는 completeOwnerSignup API 호출
   → 토큰 저장 → 대시보드 이동
```
