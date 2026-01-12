# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KKOOKK (꾸욱) is a web-based digital stamp/coupon platform for cafes and small businesses. The system allows customers to earn stamps via QR code without app installation, with store-side approval for each transaction.

### Core Flow
- Customer scans QR → accesses store's stamp card → requests stamp
- Store terminal (logged in as owner) approves/rejects stamp requests
- Stamp redemption requires OTP step-up authentication + TTL-based session + 2-factor confirmation modal
- Paper stamp migration: customers upload photo → owner manually verifies and credits stamps

## Tech Stack

### Monorepo Structure
- `/server` - Spring Boot backend
- `/client` - React frontend

### Backend (Java)
- Java 17+, Spring Boot, Gradle
- Spring Data JPA (Hibernate)
- H2 for local development → MySQL for production
- JWT authentication (access token only, no refresh in MVP)

### Frontend (React)
- React 18 + TypeScript
- Vite as build tool
- React Router for routing
- TanStack Query for data fetching
- Axios for HTTP client
- MUI (Material-UI) for components
- React Hook Form + Zod for form validation
- npm as package manager
- Mobile-responsive web (NOT PWA - no service workers/manifest/offline support)

### Real-time Communication
- Polling-based (no SSE/WebSocket in MVP)
- Customer waiting screens: poll every 2-3 seconds
- Store terminal: poll for pending requests

## Commands

### Server
```bash
cd server
./gradlew bootRun          # Run development server
./gradlew bootJar          # Build for production
./gradlew test             # Run tests
```

### Client
```bash
cd client
npm install                # Install dependencies
npm run dev               # Run development server
npm run build             # Build for production
npm run test              # Run tests with Vitest
```

### Full Application (planned)
The production build embeds the client build output into the server JAR for single-domain deployment (simplifies CORS).

## Architecture

### User Types & Tenant Structure
- **OwnerAccount** → owns multiple **Stores** → each Store has **StampCards** (MVP: 1 active StampCard per Store)
- **CustomerWallet** → identified by phone number, contains progress across multiple StampCards
- Store employees use the same owner account (no separate staff accounts in MVP)

### Authentication & Session Management

#### Owner Authentication
- Email/password login → JWT access token
- Protected APIs require `Authorization: Bearer <token>` header
- No refresh token in MVP

#### Customer Authentication
- Initial registration: Phone + OTP + Name + Nickname → creates Wallet + issues `sessionToken` (scope: FULL)
- Return visits: Phone + Name → issues `sessionToken` (scope: VIEW)
- Session token passed via `X-Wallet-Session` header
- Step-up authentication: Redemption requires fresh OTP verification (valid for 10 minutes)

### Core Domain Models

#### Stamp Issuance Flow
1. Customer creates `IssuanceRequest` (TTL: 60-120s, one-time use)
2. Customer polls request status (PENDING → APPROVED/REJECTED/EXPIRED)
3. Store terminal lists pending requests and approves/rejects
4. On approval: `WalletStampCard.stampCount` increments, `StampEvent` (type: ISSUED) logged

#### Reward Redemption Flow
1. Customer reaches stamp goal → system auto-generates `RewardInstance`
2. Customer clicks "Use Reward" → checks OTP step-up authentication
3. System creates `RedeemSession` (TTL: 30-60s)
4. Customer sees "Store Confirmation Screen" with "Process Use" button
5. Mandatory 2-factor confirmation modal: "This cannot be undone. Please confirm with store."
6. On confirmation: `RewardInstance.status` → USED, `RedeemEvent` logged (idempotent)

#### Paper Stamp Migration
1. Customer uploads photo via `StampMigrationRequest` (limited to 1 per wallet/store)
2. Owner/operator reviews photo in backoffice
3. On approval: enters approved stamp count → `WalletStampCard.stampCount` increases, `StampEvent` (type: MIGRATED) logged
4. On rejection: stores reject reason for customer visibility

### Event Sourcing Pattern
All stamp/redeem operations generate immutable event logs:
- `StampEvent` (types: ISSUED, MIGRATED, MANUAL_ADJUST)
- `RedeemEvent`

Progress (`WalletStampCard.stampCount`) is a cache/aggregation. Events are the source of truth for dispute resolution and auditing.

### Security & Fraud Prevention

#### Request Security
- QR codes contain static `storeId` only (not sensitive)
- `IssuanceRequest` and `RedeemSession`: TTL + one-time use + idempotency via `clientRequestId`
- Wallet lookup rate limiting (IP/device/phone-based cooldowns)

#### Step-up Authentication
- Redemption ALWAYS requires OTP verification
- OTP verification updates `CustomerSession.otpVerifiedUntil` (expires after 10 minutes)
- Redemption API rejects requests without valid step-up session

#### Audit Logging
All issuance/redemption/migration actions log:
- `walletId`, `storeId`, `stampCardId`, timestamp, `requestId`/`sessionId`, result

### File Upload (Migration Photos)
- Local filesystem storage in `/uploads` (MVP approach)
- File paths stored in database
- Backoffice requires authentication to view images
- Retention policy needed (e.g., delete after 30 days)

## Development Patterns

### Error Handling
- Backend: `GlobalExceptionHandler` returns standardized `{code, message, details}` format
  - `code`: Custom application error code (e.g., "C009", "M001", "A001", etc)
  - `message`: User-friendly error message
  - `details`: Optional additional context (validation errors, etc.)
- Frontend: Axios interceptor catches errors and displays toast/dialog to user
- HTTP status codes: 400 (validation), 401 (auth), 404 (not found), 409 (conflict), 410 (expired), 429 (rate limit)
- Example error response:
  ```json
  {
    "code": "C001",
    "message": "적립 요청이 만료되었습니다. 다시 시도해주세요.",
    "details": null
  }
  ```

### Data Fetching (Frontend)
- Use TanStack Query for all API calls
- Invalidate queries after mutations for immediate UI updates
- Handle loading/error states consistently

### Form Validation
- Use React Hook Form + Zod schemas
- Server-side validation mirrors client-side rules
- Display validation errors inline

### Polling Implementation
- Customer waiting screens: 2-3 second intervals, stop on completion/expiration
- Store terminal: 2-second intervals for pending lists
- Display countdown timers for TTL-based sessions
- Handle network failures with retry UI

### Testing Strategy (Minimum MVP Requirements)

#### Backend (JUnit5 + @SpringBootTest + H2)
Minimum 3 integration tests:
1. Issuance flow: create request → owner approves → `stampCount` +1, `StampEvent` logged
2. Redemption flow: valid step-up → create session → complete → `reward.status` USED, `RedeemEvent` logged, idempotency check
3. Migration flow: submit request → owner approves with count → `stampCount` increased, `StampEvent` (MIGRATED) logged

#### Frontend (Vitest + React Testing Library)
Minimum 3 render smoke tests:
1. `/s/:storeId` landing page renders with mocked API
2. `/issuance/:id/wait` polling UI with timer mock
3. `/redeem/:id/confirm` modal confirmation triggers mocked complete API call

## Key Business Rules

### StampCard Status Lifecycle
- DRAFT: Being configured, not visible to customers
- ACTIVE: Live and accepting stamps (only 1 active per store in MVP)
- PAUSED: Temporarily disabled
- ARCHIVED: Historical, no longer active

### Reward Auto-Issuance
- When `WalletStampCard.stampCount` reaches `StampCard.stampGoal`, issue 1 `RewardInstance`
- Prevent duplicate issuance for same goal achievement
- Set `expiresAt` based on `StampCard.rewardExpiresInDays`

### TTL & Expiration
- `IssuanceRequest`: 60-120 seconds
- `RedeemSession`: 30-60 seconds
- OTP challenge: 3 minutes
- Step-up session: 10 minutes
- Reward expiration: configurable per StampCard

### Rate Limiting (MVP baseline)
- Wallet lookup by phone+name: IP/device rate limits with cooldown on failures
- Issuance requests: daily limit per wallet+store combination
- Prevent request flooding with cooldown periods

## Important Constraints & Decisions

### MVP Exclusions
- NO PWA (no install prompt, manifest, service workers, offline cache)
- NO WebSocket/SSE (polling only)
- NO refresh tokens (access token only)
- NO separate staff accounts (owner account shared)
- NO OCR/AI for stamp photo detection (manual entry)
- NO marketing automation or analytics dashboards
- Real SMS OTP integration deferred (use DEV mode with logged/fixed codes)

### Single Active StampCard Policy
In MVP, each Store can have only 1 ACTIVE StampCard at a time. Attempting to create a second active card returns 409 conflict (or alternative: auto-return existing active card).

### Manual Stamp Migration Processing
Paper stamp photo migration is processed manually by operators in backoffice. Future automation (OCR/AI detection) is backlog.

### OTP Development Mode
For MVP development, OTP codes can be:
- Logged to console
- Fixed code (e.g., "123456") for testing
- Real SMS integration is post-MVP

### Client-Server Integration
Production deployment option: Frontend build artifacts served by Spring Boot (single JAR, single domain, simplified CORS).

## Code Organization Principles

### Backend Package Structure (expected)
```
com.kkookk
├── auth/          # JWT, session management
├── owner/         # Owner accounts, stores
├── customer/      # Wallets, sessions
├── stampcard/     # StampCard, RewardRule
├── issuance/      # IssuanceRequest, StampEvent
├── redemption/    # RedeemSession, RedeemEvent, RewardInstance
├── migration/     # StampMigrationRequest
└── common/        # Shared utilities, error handling
```

### Frontend Route Structure (expected)
```
/                          # Landing/marketing (optional)
/s/:storeId               # Customer QR entry point
/wallet/register          # Customer registration
/wallet/access            # Customer login
/wallet/home              # Customer wallet dashboard
/issuance/:id/wait        # Stamp request waiting screen
/redeem/:id/confirm       # Redemption confirmation screen

/owner/login              # Owner login
/owner/register           # Owner signup
/owner/stores             # Store list
/owner/stores/:id         # Store detail
/owner/stampcards/:id     # StampCard editor
/owner/terminal           # Store approval terminal
/owner/migrations         # Migration request review
/owner/logs               # Audit logs
```

## Common Pitfalls to Avoid

1. **Do not skip step-up OTP check on redemption** - This is a critical security requirement
2. **Always log events** - StampEvent/RedeemEvent must be created for audit trail
3. **Enforce TTL expiration** - IssuanceRequest and RedeemSession must respect expiration times
4. **Implement idempotency** - Use clientRequestId to prevent duplicate stamps/redemptions
5. **Validate StampCard is ACTIVE** - Only active cards should accept new stamps
6. **Check reward availability** - RewardInstance must be AVAILABLE (not USED/EXPIRED) before redemption
7. **Prevent duplicate reward issuance** - When stampCount reaches goal, issue reward exactly once
8. **Handle polling errors gracefully** - Network failures during polling should show retry UI, not crash
9. **Enforce 2-factor confirmation** - Redemption completion requires modal confirmation, not just button click
10. **Rate limit wallet lookups** - Phone+name lookup is vulnerable to enumeration attacks
