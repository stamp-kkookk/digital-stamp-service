# Feature: Auth (인증)

> KKOOKK 플랫폼의 3가지 사용자 유형(Owner, Terminal, Customer)에 대한
> 인증/인가 체계. JWT 기반 stateless 인증을 사용하며, 고객은 OTP 인증 후
> StepUp 토큰으로 민감 기능에 접근한다.

## Status: Implemented

---

## 1. Overview

KKOOKK은 4가지 토큰 타입을 사용하여 역할 기반 접근 제어를 구현한다:

| Token Type | Role | Subject | Purpose |
|------------|------|---------|---------|
| OWNER | ROLE_OWNER | ownerId | 점주 백오피스 전체 접근 |
| TERMINAL | ROLE_TERMINAL | ownerId | 매장 단말기 (적립 승인/거절) |
| CUSTOMER | ROLE_CUSTOMER | walletId | 고객 지갑, 적립 요청, 내역 조회 |
| STEPUP | ROLE_CUSTOMER + ROLE_STEPUP | walletId | OTP 인증 후 민감 기능 (리딤, 마이그레이션) |

---

## 2. Backend Architecture

### 2.1 Package Structure

```
com.project.kkookk/
├── owner/
│   ├── controller/
│   │   ├── OwnerAuthApi.java           # Swagger interface
│   │   ├── OwnerAuthController.java    # /api/owner/auth/*
│   │   └── dto/
│   │       ├── OwnerSignupRequest.java
│   │       ├── OwnerSignupResponse.java
│   │       ├── OwnerLoginRequest.java
│   │       └── OwnerLoginResponse.java
│   ├── domain/
│   │   └── OwnerAccount.java           # Entity (table: owner_account)
│   ├── repository/
│   │   └── OwnerAccountRepository.java
│   └── service/
│       └── OwnerAuthService.java
│
├── terminal/
│   ├── controller/
│   │   ├── TerminalAuthApi.java        # Swagger interface
│   │   ├── TerminalAuthController.java # /api/public/terminal/*
│   │   └── dto/
│   │       ├── TerminalLoginRequest.java
│   │       └── TerminalLoginResponse.java
│   └── service/
│       └── TerminalAuthService.java
│
├── otp/
│   ├── controller/
│   │   ├── OtpApi.java                 # Swagger interface
│   │   └── OtpController.java          # /api/public/otp/*
│   ├── dto/
│   │   ├── OtpRequestDto.java
│   │   ├── OtpRequestResponse.java
│   │   ├── OtpVerifyDto.java
│   │   └── OtpVerifyResponse.java
│   └── service/
│       └── OtpService.java
│
├── wallet/
│   ├── controller/
│   │   ├── WalletApi.java              # Swagger interface
│   │   └── WalletController.java       # /api/public/wallet/*
│   ├── dto/
│   │   ├── WalletRegisterRequest.java
│   │   ├── WalletRegisterResponse.java
│   │   ├── CustomerLoginRequest.java
│   │   └── CustomerLoginResponse.java
│   └── service/
│       └── CustomerWalletService.java
│
└── global/
    ├── config/
    │   ├── SecurityConfig.java         # Spring Security filter chain
    │   ├── JwtConfig.java              # JWT bean registration
    │   └── JwtProperties.java          # application.yaml binding
    ├── security/
    │   ├── JwtAuthenticationFilter.java # OncePerRequestFilter
    │   ├── TokenType.java              # Enum: OWNER, TERMINAL, CUSTOMER, STEPUP
    │   ├── OwnerPrincipal.java         # UserDetails (ROLE_OWNER)
    │   ├── TerminalPrincipal.java      # UserDetails (ROLE_TERMINAL + storeId)
    │   └── CustomerPrincipal.java      # UserDetails (ROLE_CUSTOMER + optional ROLE_STEPUP)
    └── util/
        └── JwtUtil.java                # Token generation & parsing
```

---

## 3. Auth Flow 1: Owner Signup / Login

### 3.1 API Endpoints

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/owner/auth/signup` | Public | 201 | 회원가입 |
| POST | `/api/owner/auth/login` | Public | 200 | 로그인 (JWT 발급) |

### 3.2 Signup Sequence

```
Owner Browser       OwnerAuthController      OwnerAuthService      OwnerAccountRepo     PasswordEncoder
     |                     |                       |                      |                    |
     |--POST /signup------>|                       |                      |                    |
     |  {email, password,  |                       |                      |                    |
     |   name, phoneNumber}|                       |                      |                    |
     |                     |--signup(request)------>|                      |                    |
     |                     |                       |--existsByEmail------->|                    |
     |                     |                       |<--false (OK)----------|                    |
     |                     |                       |                      |                    |
     |                     |                       |--encode(password)---->|                    |
     |                     |                       |<--passwordHash--------|------>|            |
     |                     |                       |                      |       |            |
     |                     |                       |--save(OwnerAccount)-->|       |            |
     |                     |                       |<--saved entity--------|       |            |
     |                     |<--OwnerSignupResponse--|                      |       |            |
     |<--201 + body--------|                       |                      |                    |
```

### 3.3 Login Sequence

```
Owner Browser       OwnerAuthController      OwnerAuthService      OwnerAccountRepo  PasswordEncoder  JwtUtil
     |                     |                       |                      |               |              |
     |--POST /login------->|                       |                      |               |              |
     |  {email, password}  |                       |                      |               |              |
     |                     |--login(request)------->|                      |               |              |
     |                     |                       |--findByEmail--------->|               |              |
     |                     |                       |<--OwnerAccount--------|               |              |
     |                     |                       |                      |               |              |
     |                     |                       |--matches(password,--->|               |              |
     |                     |                       |   passwordHash)      |               |              |
     |                     |                       |<--true (OK)----------|               |              |
     |                     |                       |                      |               |              |
     |                     |                       |--generateOwnerToken->|               |              |
     |                     |                       |  (ownerId, email)    |               |----->|       |
     |                     |                       |<--accessToken--------|               |      |       |
     |                     |                       |                      |               |              |
     |                     |<--OwnerLoginResponse---|                      |               |              |
     |                     |  {accessToken, id,     |                      |               |              |
     |                     |   email, name, phone}  |                      |               |              |
     |<--200 + body--------|                       |                      |               |              |
```

### 3.4 OwnerSignupRequest DTO

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| email | String | Yes | @NotBlank, @Email, @Size(max=255) | "owner@example.com" |
| password | String | Yes | @NotBlank, @Size(min=8, max=20), @Pattern(letter+digit+special) | "Password1!" |
| name | String | No | @Size(max=100) | "홍길동" |
| phoneNumber | String | Yes | @NotBlank, @Pattern(`^01[0-9]-?\d{3,4}-?\d{4}$`) | "010-1234-5678" |

### 3.5 Password Requirements

```
Pattern: ^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$
```

- Length: 8-20 characters
- Must contain: at least 1 letter (A-Z or a-z)
- Must contain: at least 1 digit (0-9)
- Must contain: at least 1 special character (@$!%*#?&)
- Hashing: BCrypt via `BCryptPasswordEncoder`

### 3.6 OwnerLoginRequest DTO

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| email | String | Yes | @NotBlank, @Email, @Size(max=255) | "owner@example.com" |
| password | String | Yes | @NotBlank, @Size(min=8, max=20) | "Password1!" |

### 3.7 OwnerSignupResponse DTO

| Field | Type | Description |
|-------|------|-------------|
| id | Long | 생성된 점주 계정 ID |
| email | String | 이메일 |
| name | String | 이름 |
| phoneNumber | String | 전화번호 |
| createdAt | LocalDateTime | 생성 시각 |

### 3.8 OwnerLoginResponse DTO

| Field | Type | Description |
|-------|------|-------------|
| accessToken | String | JWT 액세스 토큰 (type=OWNER) |
| id | Long | 점주 계정 ID |
| email | String | 이메일 |
| name | String | 이름 |
| phoneNumber | String | 전화번호 |

---

## 4. Auth Flow 2: Terminal Login

### 4.1 API Endpoints

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/public/terminal/login` | Public | 200 | 터미널 로그인 (Owner 자격 + storeId) |

### 4.2 Login Sequence

```
Terminal Device      TerminalAuthController   TerminalAuthService   OwnerAccountRepo  StoreRepo  JwtUtil
     |                      |                       |                     |             |          |
     |--POST /login-------->|                       |                     |             |          |
     |  {email, password,   |                       |                     |             |          |
     |   storeId}           |                       |                     |             |          |
     |                      |--login(request)------->|                     |             |          |
     |                      |                       |                     |             |          |
     |                      |           [Step 1: Owner 인증]               |             |          |
     |                      |                       |--findByEmail-------->|             |          |
     |                      |                       |<--OwnerAccount------|             |          |
     |                      |                       |--matches(password)->|             |          |
     |                      |                       |<--true (OK)---------|             |          |
     |                      |                       |                     |             |          |
     |                      |           [Step 2: 매장 소유권 확인]          |             |          |
     |                      |                       |--findByIdAnd------->|             |          |
     |                      |                       |  OwnerAccountId     |------------>|          |
     |                      |                       |<--Store-------------|             |          |
     |                      |                       |                     |             |          |
     |                      |           [Step 3: Terminal 토큰 발급]        |             |          |
     |                      |                       |--generateTerminal-->|             |          |
     |                      |                       |  Token(ownerId,     |             |--------->|
     |                      |                       |  email, storeId)    |             |          |
     |                      |                       |<--accessToken-------|             |          |
     |                      |                       |                     |             |          |
     |                      |<--TerminalLoginResp---|                     |             |          |
     |<--200 + body---------|                       |                     |             |          |
```

### 4.3 TerminalLoginRequest DTO

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| email | String | Yes | @NotBlank, @Email | "owner@example.com" |
| password | String | Yes | @NotBlank | "password123" |
| storeId | Long | Yes | @NotNull | 1 |

### 4.4 TerminalLoginResponse DTO

| Field | Type | Description |
|-------|------|-------------|
| accessToken | String | JWT 액세스 토큰 (type=TERMINAL, storeId claim 포함) |
| ownerId | Long | 점주 ID |
| storeId | Long | 매장 ID |
| storeName | String | 매장 이름 |

### 4.5 Terminal JWT Unique Claims

Terminal JWT에는 일반 Owner JWT와 달리 `storeId` claim이 추가로 포함된다:

```json
{
  "sub": "1",           // ownerId
  "type": "TERMINAL",
  "email": "owner@example.com",
  "storeId": 42,        // Terminal 전용 claim
  "iat": 1700000000,
  "exp": 1700003600
}
```

---

## 5. Auth Flow 3: Customer OTP Verification

### 5.1 API Endpoints

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/public/otp/request` | Public | 200 | OTP 요청 (SMS 발송) |
| POST | `/api/public/otp/verify` | Public | 200 | OTP 검증 (StepUp 토큰 발급) |

### 5.2 OTP Request Sequence

```
Customer App        OtpController           OtpService            In-Memory Store
     |                    |                      |                       |
     |--POST /request---->|                      |                       |
     |  {phone}           |                      |                       |
     |                    |--requestOtp(phone)--->|                       |
     |                    |                      |                       |
     |                    |        [Rate limit check]                    |
     |                    |                      |--rateLimitStore.get-->|
     |                    |                      |<--RateLimitData------|
     |                    |                      |                       |
     |                    |                      | [count >= 2 in 60s?]  |
     |                    |                      |  throw OTP_RATE_LIMIT |
     |                    |                      |                       |
     |                    |                      |--generateOtpCode()    |
     |                    |                      |  (6-digit random)     |
     |                    |                      |                       |
     |                    |                      |--otpStore.put-------->|
     |                    |                      |  (phone -> OtpData)   |
     |                    |                      |                       |
     |                    |                      | [TODO: SMS 발송]       |
     |                    |                      |                       |
     |                    |<--otpCode (dev only)--|                       |
     |                    |                      |                       |
     |<--200 {success:    |                      |                       |
     |  true, devOtpCode} |                      |                       |
```

### 5.3 OTP Verify Sequence

```
Customer App        OtpController           OtpService         In-Memory   WalletRepo  JwtUtil
     |                    |                      |                 |            |          |
     |--POST /verify----->|                      |                 |            |          |
     |  {phone, code}     |                      |                 |            |          |
     |                    |--verifyOtp(phone,---->|                 |            |          |
     |                    |   code)              |                 |            |          |
     |                    |                      |--otpStore.get-->|            |          |
     |                    |                      |<--OtpData-------|            |          |
     |                    |                      |                 |            |          |
     |                    |       [null?] throw OTP_INVALID        |            |          |
     |                    |       [expired?] throw OTP_EXPIRED     |            |          |
     |                    |       [attempts>=3?] throw OTP_ATTEMPTS_EXCEEDED    |          |
     |                    |       [code mismatch?] attempts++ & throw OTP_INVALID          |
     |                    |                      |                 |            |          |
     |                    |       [code match = SUCCESS]           |            |          |
     |                    |                      |--otpStore.remove>|            |          |
     |                    |                      |                 |            |          |
     |                    |                      |--findByPhone--->|            |          |
     |                    |                      |<--Optional------|----------->|          |
     |                    |                      |  <Wallet>       |            |          |
     |                    |                      |                 |            |          |
     |                    |                      | [wallet present?]            |          |
     |                    |                      |--generateStepUp>|            |--------->|
     |                    |                      |  Token(walletId)|            |          |
     |                    |                      |<--stepUpToken---|            |          |
     |                    |                      |                 |            |          |
     |                    |<--OtpVerifyResult-----|                 |            |          |
     |                    |  {verified, stepUp}   |                 |            |          |
     |<--200 {verified:   |                      |                 |            |          |
     |  true, stepUpToken}|                      |                 |            |          |
```

### 5.4 OTP Configuration Constants

| Parameter | Value | Description |
|-----------|-------|-------------|
| OTP_LENGTH | 6 | OTP 코드 자릿수 |
| OTP_TTL_MINUTES | 3 | OTP 유효기간 (분) |
| RATE_LIMIT_SECONDS | 60 | Rate limit 윈도우 (초) |
| RATE_LIMIT_MAX_REQUESTS | 2 | 윈도우 내 최대 요청 수 |
| MAX_ATTEMPTS | 3 | OTP 코드 최대 시도 횟수 |

### 5.5 OTP State Machine

```
                      requestOtp(phone)
                            |
                            v
    +-----[Rate limit check]------+
    |                              |
    | [count < 2 in 60s]           | [count >= 2]
    v                              v
  Generate 6-digit           throw OTP_RATE_LIMIT
  Store in otpStore            (429)
  (phone -> {code, createdAt, attempts=0})
    |
    v
  OTP Created (waiting for verify)
    |
    |---- verifyOtp(phone, code) ---->
    |
    v
  +------[Lookup otpStore]------+
  |              |              |
  | [not found]  | [found]      |
  v              v              |
throw          +--[expired?]--+ |
OTP_INVALID    |              | |
               | [yes]        | [no]
               v              v
          throw OTP_EXPIRED  +--[attempts >= 3?]--+
                             |                     |
                             | [yes]               | [no]
                             v                     v
                       throw OTP_         +--[code match?]--+
                       ATTEMPTS_          |                  |
                       EXCEEDED           | [no]             | [yes]
                                          v                  v
                                    attempts++          Remove OTP
                                    throw OTP_INVALID   Issue StepUp Token
                                    (if attempts>=3     Return success
                                     after ++: throw
                                     ATTEMPTS_EXCEEDED)
```

### 5.6 OtpRequestDto

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| phone | String | Yes | @NotBlank, @Pattern(`^01[0-9]-?\d{3,4}-?\d{4}$`) | "010-1234-5678" |

### 5.7 OtpRequestResponse

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | 요청 성공 여부 |
| devOtpCode | String | *시연용* OTP 코드 (프로덕션에서 제거 필요) |

### 5.8 OtpVerifyDto

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| phone | String | Yes | @NotBlank, @Pattern(`^01[0-9]-?\d{3,4}-?\d{4}$`) | "010-1234-5678" |
| code | String | Yes | @NotBlank, @Pattern(`^\d{6}$`) | "123456" |

### 5.9 OtpVerifyResponse

| Field | Type | Description |
|-------|------|-------------|
| verified | boolean | 검증 성공 여부 |
| stepUpToken | String | StepUp JWT 토큰 (성공 시, 10분 TTL). 지갑 미등록 시 null. |

---

## 6. Auth Flow 4: Customer Wallet Register / Login

### 6.1 API Endpoints

| Method | Path | Auth | Status | Description |
|--------|------|------|--------|-------------|
| POST | `/api/public/wallet/register` | Public | 201 | 지갑 생성 + JWT 발급 |
| POST | `/api/public/wallet/login` | Public | 200 | 기존 고객 로그인 + JWT 발급 |

### 6.2 Register Sequence

```
Customer App       WalletController     CustomerWalletService    WalletRepo    JwtUtil
     |                    |                      |                    |           |
     |--POST /register--->|                      |                    |           |
     |  {phone, name,     |                      |                    |           |
     |   nickname, storeId}|                      |                    |           |
     |                    |--register(request)--->|                    |           |
     |                    |                      |--findByPhone------->|           |
     |                    |                      |<--Optional.empty()--|           |
     |                    |                      |                    |           |
     |                    |                      |--save(new Wallet)->|           |
     |                    |                      |<--saved wallet-----|           |
     |                    |                      |                    |           |
     |                    |                      | [storeId != null?]  |           |
     |                    |                      |  auto-create        |           |
     |                    |                      |  WalletStampCard    |           |
     |                    |                      |                    |           |
     |                    |                      |--generateCustomer->|           |
     |                    |                      |  Token(walletId)   |---------->|
     |                    |                      |<--accessToken------|           |
     |                    |                      |                    |           |
     |                    |<--WalletRegister------|                    |           |
     |                    |   Response            |                    |           |
     |<--201 + body-------|                      |                    |           |
```

### 6.3 Login Sequence

```
Customer App       WalletController     CustomerWalletService    WalletRepo    JwtUtil
     |                    |                      |                    |           |
     |--POST /login------>|                      |                    |           |
     |  {phone, name,     |                      |                    |           |
     |   storeId}         |                      |                    |           |
     |                    |--login(request)------->|                    |           |
     |                    |                      |--findByPhoneAndName>|           |
     |                    |                      |<--CustomerWallet----|           |
     |                    |                      |                    |           |
     |                    |                      | [not found?] throw  |           |
     |                    |                      |  CUSTOMER_WALLET_   |           |
     |                    |                      |  NOT_FOUND          |           |
     |                    |                      |                    |           |
     |                    |                      | [storeId != null?]  |           |
     |                    |                      |  auto-create        |           |
     |                    |                      |  WalletStampCard    |           |
     |                    |                      |  (if not exists)    |           |
     |                    |                      |                    |           |
     |                    |                      |--generateCustomer->|           |
     |                    |                      |  Token(walletId)   |---------->|
     |                    |                      |<--accessToken------|           |
     |                    |                      |                    |           |
     |                    |<--CustomerLoginResp---|                    |           |
     |<--200 + body-------|                      |                    |           |
```

### 6.4 WalletRegisterRequest DTO

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| phone | String | Yes | @NotBlank, @Pattern(`^01[0-9]-?\d{3,4}-?\d{4}$`) | "010-1234-5678" |
| name | String | Yes | @NotBlank, @Size(max=50) | "홍길동" |
| nickname | String | Yes | @NotBlank, @Size(max=50) | "길동이" |
| storeId | Long | No | | 1 |

### 6.5 WalletRegisterResponse DTO

| Field | Type | Description |
|-------|------|-------------|
| accessToken | String | JWT 액세스 토큰 (type=CUSTOMER) |
| walletId | Long | 지갑 ID |
| phone | String | 전화번호 |
| name | String | 이름 |
| nickname | String | 닉네임 |
| stampCard | RegisteredStampCardInfo | 발급된 스탬프카드 정보 (매장 진입 시에만, nullable) |

### 6.6 CustomerLoginRequest DTO

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| phone | String | Yes | @NotBlank, @Pattern | "010-1234-5678" |
| nickname | String | Yes | @NotBlank, @Size(max=50) | "길동이" |
| storeId | Long | Yes | @NotNull | 1 |

### 6.7 CustomerLoginResponse DTO

| Field | Type | Description |
|-------|------|-------------|
| accessToken | String | JWT 액세스 토큰 (type=CUSTOMER) |
| walletId | Long | 지갑 ID |
| phone | String | 전화번호 |
| name | String | 이름 |
| nickname | String | 닉네임 |
| stampCards | List\<WalletStampCardSummary\> | 보유 스탬프카드 목록 (현재 매장 카드가 첫번째) |

---

## 7. JWT Infrastructure

### 7.1 JwtProperties (application.yaml binding)

```yaml
jwt:
  secret: <HMAC-SHA256 key, min 32 bytes>
  access-token-expiration: 3600000    # 1 hour (ms)
  stepup-token-expiration: 600000     # 10 minutes (ms)
```

### 7.2 Token Types and Claims

| Token Type | Subject (sub) | Claims | TTL | Authority |
|------------|--------------|--------|-----|-----------|
| OWNER | ownerId | type=OWNER, email | accessTokenExpiration | ROLE_OWNER |
| TERMINAL | ownerId | type=TERMINAL, email, storeId | accessTokenExpiration | ROLE_TERMINAL |
| CUSTOMER | walletId | type=CUSTOMER | accessTokenExpiration | ROLE_CUSTOMER |
| STEPUP | walletId | type=STEPUP | stepupTokenExpiration (10min) | ROLE_CUSTOMER + ROLE_STEPUP |

### 7.3 JwtUtil Token Generation Methods

```java
String generateOwnerToken(Long ownerId, String email)
String generateTerminalToken(Long ownerId, String email, Long storeId)
String generateCustomerToken(Long walletId)
String generateStepUpToken(Long walletId)
```

### 7.4 JwtAuthenticationFilter Flow

```
HTTP Request
     |
     v
[Extract "Authorization: Bearer <token>"]
     |
     +--[null?]--> Skip filter, continue chain (anonymous)
     |
     v
[jwtUtil.validateToken(token)]
     |
     +--[false/exception?]--> Log error, continue chain (anonymous)
     |
     v
[jwtUtil.getTokenType(token)]
     |
     +--[null?]--> Log warning, skip authentication
     |
     +--[OWNER]--> OwnerPrincipal.of(subjectId, email)
     |              authorities: [ROLE_OWNER]
     |
     +--[TERMINAL]--> TerminalPrincipal.of(subjectId, email, storeId)
     |                 authorities: [ROLE_TERMINAL]
     |
     +--[CUSTOMER]--> CustomerPrincipal.of(subjectId, false)
     |                 authorities: [ROLE_CUSTOMER]
     |
     +--[STEPUP]--> CustomerPrincipal.of(subjectId, true)
                     authorities: [ROLE_CUSTOMER, ROLE_STEPUP]
     |
     v
[Set SecurityContext with UsernamePasswordAuthenticationToken]
     |
     v
[Continue filter chain]
```

### 7.5 Principal Classes

#### OwnerPrincipal

| Field | Type | Description |
|-------|------|-------------|
| ownerId | Long | 점주 계정 ID |
| email | String | 이메일 |
| authorities | Collection | [ROLE_OWNER] |

#### TerminalPrincipal

| Field | Type | Description |
|-------|------|-------------|
| ownerId | Long | 점주 계정 ID |
| email | String | 이메일 |
| storeId | Long | 로그인한 매장 ID |
| authorities | Collection | [ROLE_TERMINAL] |

#### CustomerPrincipal

| Field | Type | Description |
|-------|------|-------------|
| walletId | Long | 고객 지갑 ID |
| stepUp | boolean | StepUp 인증 여부 |
| authorities | Collection | stepUp ? [ROLE_CUSTOMER, ROLE_STEPUP] : [ROLE_CUSTOMER] |

---

## 8. Security Configuration (SecurityConfig)

### 8.1 URL Authorization Matrix

| URL Pattern | Required Role | Description |
|-------------|--------------|-------------|
| `/api/owner/auth/**` | permitAll | 점주 로그인/회원가입 |
| `/api/public/otp/**` | permitAll | OTP 요청/검증 |
| `/api/public/wallet/**` | permitAll | 지갑 등록/로그인 |
| `/api/public/**` | permitAll | 공개 API (매장 정보 등) |
| `/api/customer/wallet/stamp-cards` | permitAll | 특정 고객 경로 허용 |
| `/api/customer/**` | ROLE_CUSTOMER | 고객 기능 |
| `/api/terminal/**` | ROLE_TERMINAL | 터미널 기능 |
| `/api/owner/**` | ROLE_OWNER | 점주 백오피스 |
| `/swagger-ui/**`, `/v3/api-docs/**` | permitAll | Swagger UI |

### 8.2 Session Policy

- `SessionCreationPolicy.STATELESS` -- JWT 기반이므로 서버 세션 없음
- CSRF disabled (stateless REST API)
- CORS: 개발 중 전체 허용 (`*`), 프로덕션 배포 전 제한 필요

---

## 9. Error Codes

| ErrorCode | HTTP Status | Code String | Korean Message | Trigger |
|-----------|-------------|-------------|----------------|---------|
| OWNER_EMAIL_DUPLICATED | 409 | OWNER_EMAIL_DUPLICATED | 이미 사용 중인 이메일입니다 | 가입 시 이메일 중복 |
| OWNER_LOGIN_ID_DUPLICATED | 409 | OWNER_LOGIN_ID_DUPLICATED | 이미 사용 중인 로그인 ID입니다 | 로그인 ID 중복 |
| OWNER_LOGIN_FAILED | 401 | OWNER_LOGIN_FAILED | 이메일 또는 비밀번호가 올바르지 않습니다 | 이메일 미존재 또는 비밀번호 불일치 |
| TERMINAL_ACCESS_DENIED | 403 | TERMINAL_ACCESS_DENIED | 단말기 접근 권한이 없습니다 | 터미널 로그인 시 매장 비소유 |
| OTP_RATE_LIMIT_EXCEEDED | 429 | OTP_001 | OTP 요청 제한을 초과했습니다 | 60초 내 2회 초과 요청 |
| OTP_EXPIRED | 401 | OTP_002 | OTP가 만료되었습니다 | 3분 초과 후 검증 시도 |
| OTP_INVALID | 401 | OTP_003 | OTP가 일치하지 않습니다 | 코드 불일치 또는 미존재 |
| OTP_ATTEMPTS_EXCEEDED | 401 | OTP_004 | OTP 시도 횟수를 초과했습니다 | 3회 실패 |
| WALLET_PHONE_DUPLICATED | 409 | WALLET_001 | 이미 등록된 전화번호입니다 | 지갑 등록 시 전화번호 중복 |
| WALLET_NICKNAME_DUPLICATED | 409 | WALLET_002 | 이미 사용 중인 닉네임입니다 | 지갑 등록 시 닉네임 중복 |
| CUSTOMER_WALLET_NOT_FOUND | 404 | CUSTOMER_WALLET_NOT_FOUND | 해당 전화번호와 닉네임으로 지갑을 찾을 수 없습니다 | 고객 로그인 실패 |
| CUSTOMER_WALLET_BLOCKED | 403 | CUSTOMER_WALLET_BLOCKED | 차단된 지갑입니다 | 차단 상태 지갑 접근 |
| UNAUTHORIZED | 401 | UNAUTHORIZED | 인증이 필요합니다 | 토큰 없이 인증 필요 엔드포인트 접근 |
| ACCESS_DENIED | 403 | ACCESS_DENIED | 접근 권한이 없습니다 | 역할 불일치 |
| STEPUP_REQUIRED | 403 | STEPUP_REQUIRED | OTP 인증이 필요합니다 | StepUp 없이 민감 기능 접근 |

---

## 10. Edge Cases

### 10.1 Owner Login: Same Error for Email Not Found and Wrong Password

- **Behavior**: Both cases throw `OWNER_LOGIN_FAILED` (401).
- **Security**: Prevents email enumeration attacks. Attacker cannot determine whether an email is registered.

### 10.2 Terminal Login: Store Ownership Check After Auth

- **Behavior**: First authenticates the owner, then verifies store ownership via `findByIdAndOwnerAccountId`.
- **Error**: `TERMINAL_ACCESS_DENIED` (403) if store doesn't belong to the owner. Unlike the owner store API (which returns 404), terminal login explicitly returns 403 because the owner identity is already confirmed.

### 10.3 OTP: In-Memory Storage Limitation

- **Current**: `ConcurrentHashMap` in `OtpService`. Data lost on server restart.
- **Impact**: All pending OTPs are invalidated on deployment/restart.
- **Future**: Migrate to Redis for production.

### 10.4 OTP: Rate Limit Window Reset

- **Behavior**: Rate limit window starts from the first request. After 60 seconds, the window resets completely (new `RateLimitData` created).
- **Edge case**: If first request at T=0, second at T=59 (allowed), third at T=61 (allowed, new window).

### 10.5 OTP: StepUp Token Not Issued for Unregistered Phone

- **Behavior**: If `customerWalletRepository.findByPhone()` returns empty, `stepUpToken` is null in the response even though OTP verification succeeded.
- **Frontend flow**: After OTP verification, if no stepUpToken, redirect to wallet registration.

### 10.6 Customer Login: Auto-Create WalletStampCard

- **Behavior**: When a customer logs in with a storeId, if no WalletStampCard exists for that store's active stamp card, one is automatically created.
- **Precondition**: Store must have an ACTIVE stamp card.

### 10.7 JWT Token Expiry: No Refresh Token

- **Current**: No refresh token mechanism. When token expires, user must re-authenticate.
- **Impact**: Owner/Terminal sessions expire after `accessTokenExpiration` (configured in YAML). Customer StepUp expires after 10 minutes.

---

## 11. Frontend Integration

### 11.1 Feature Directory

```
frontend/src/features/auth/
├── api/
│   └── authApi.ts            # API calls (requestOtp, verifyOtp, etc.)
├── components/
│   ├── LoginForm.tsx          # Owner login form
│   ├── SignupForm.tsx         # Owner signup form
│   ├── CustomerLoginForm.tsx  # Customer phone+nickname login
│   ├── CustomerSignupForm.tsx # Customer registration
│   └── PhoneVerification.tsx  # OTP request + verify UI
├── hooks/
│   └── useAuth.ts            # TanStack Query mutations for all auth flows
├── pages/
│   └── OwnerLoginPage.tsx    # Owner login page
├── types.ts                  # AuthMode, LoginCredentials, etc.
└── index.ts                  # Public exports
```

### 11.2 TanStack Query Hooks

```typescript
// OTP
useOtpRequest()   -- mutationFn: requestOtp(data)
useOtpVerify()    -- mutationFn: verifyOtp(data), onSuccess: setStepUpToken()

// Wallet
useWalletRegister() -- mutationFn: registerWallet(data), onSuccess: setAuthToken('customer')
useWalletLogin()    -- mutationFn: loginWallet(data), onSuccess: setAuthToken('customer')

// Owner
useOwnerSignup()  -- mutationFn: ownerSignup(data)
useOwnerLogin()   -- mutationFn: ownerLogin(data), onSuccess: setAuthToken('owner')

// Store public info (query, not mutation)
useStorePublicInfo(storeId) -- queryKey: QUERY_KEYS.storePublicInfo(storeId)

// Logout
useLogout()       -- mutationFn: clearAuthToken()
```

### 11.3 Token Storage (Client-Side)

```typescript
setAuthToken(token, type)   // Store JWT + user type in localStorage
setStepUpToken(token)       // Store StepUp token separately
setUserInfo(info)           // Store user profile
clearAuthToken()            // Clear all auth data on logout
```

### 11.4 TanStack Query Keys (Auth-Related)

```typescript
QUERY_KEYS.storePublicInfo = (storeId: number) =>
  ['public', 'store', storeId] as const

QUERY_KEYS.publicStores = () =>
  ['public', 'stores'] as const
```

### 11.5 API Endpoints (Frontend)

```typescript
API_ENDPOINTS.PUBLIC.OTP_REQUEST      = '/api/public/otp/request'
API_ENDPOINTS.PUBLIC.OTP_VERIFY       = '/api/public/otp/verify'
API_ENDPOINTS.PUBLIC.WALLET_REGISTER  = '/api/public/wallet/register'
API_ENDPOINTS.PUBLIC.WALLET_LOGIN     = '/api/public/wallet/login'
API_ENDPOINTS.PUBLIC.STORE_INFO       = (storeId) => `/api/public/stores/${storeId}`
API_ENDPOINTS.PUBLIC.STORES           = '/api/public/stores'
API_ENDPOINTS.OWNER.SIGNUP            = '/api/owner/auth/signup'
API_ENDPOINTS.OWNER.LOGIN             = '/api/owner/auth/login'
API_ENDPOINTS.TERMINAL.LOGIN          = '/api/public/terminal/login'
```

---

## 12. Complete Auth Flow Diagram (Customer End-to-End)

```
[Customer scans QR code]
     |
     v
[Load store info] --> GET /api/public/stores/{storeId}
     |
     v
[Has existing wallet?]
     |
     +--[No]--> [OTP Request] --> POST /api/public/otp/request {phone}
     |                |
     |                v
     |          [Enter OTP code]
     |                |
     |                v
     |          [OTP Verify] --> POST /api/public/otp/verify {phone, code}
     |                |
     |                v
     |          [stepUpToken received?]
     |                |
     |                +--[null (new user)]--> [Register] --> POST /api/public/wallet/register
     |                |                        {phone, name, nickname, storeId}
     |                |                             |
     |                |                             v
     |                |                       accessToken (CUSTOMER) issued
     |                |                       WalletStampCard auto-created
     |                |
     |                +--[token exists (returning user)]--> stepUpToken stored
     |                                                      for later sensitive ops
     |
     +--[Yes]--> [Login] --> POST /api/public/wallet/login {phone, nickname, storeId}
                     |
                     v
                accessToken (CUSTOMER) issued
                WalletStampCard auto-created if needed
                     |
                     v
              [Customer main screen: wallet, stamp progress, etc.]
                     |
                     v
              [Need redeem/migration?] --> Check stepUpToken
                     |
                     +--[expired/missing]--> Re-do OTP flow to get new STEPUP token
                     |
                     +--[valid]--> Proceed with STEPUP-required API calls
```

---

## 13. Database Tables (Reference)

### 13.1 owner_account

```sql
CREATE TABLE owner_account (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(255) NOT NULL UNIQUE,
    login_id       VARCHAR(255) UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    name           VARCHAR(100),
    phone_number   VARCHAR(50)  NOT NULL,
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,

    UNIQUE INDEX idx_owner_email (email)
);
```

### 13.2 customer_wallet

```sql
CREATE TABLE customer_wallet (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone      VARCHAR(50) NOT NULL UNIQUE,
    name       VARCHAR(50) NOT NULL,
    nickname   VARCHAR(50) UNIQUE,
    status     VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,

    UNIQUE INDEX idx_wallet_phone (phone)
);
```
