# Utility Registry

> 재사용 코드 레지스트리. 새 유틸리티 추가 시 이 문서도 업데이트한다. 코드 작성 전 이 목록을 확인하여 중복 생성을 방지한다.

## Backend

### Global Utilities

| 클래스 | 패키지 | 용도 | 주요 메서드 |
|--------|--------|------|------------|
| JwtUtil | `global/util/` | JWT 토큰 생성/파싱/검증 | `generateOwnerToken(id, email, isAdmin)`, `generateCustomerToken()`, `generateStepUpToken()`, `getTokenType()`, `getSubjectId()`, `validateToken()` |
| PhoneValidator | `global/util/` | 전화번호 유효성 검증 | `validate(phone)` - 한국 휴대폰 번호 형식 검증 |

### Principal 타입 (Security)

| 클래스 | Fields | Roles | 용도 |
|--------|--------|-------|------|
| CustomerPrincipal | `walletId`, `stepUp` | ROLE_CUSTOMER, ROLE_STEPUP(조건부) | 고객 지갑 요청 |
| OwnerPrincipal | `ownerId`, `email`, `admin` | ROLE_OWNER, ROLE_ADMIN(조건부: admin=true) | 백오피스 작업 + 관리자 + 적립 승인 |

### Base Entity

| 클래스 | 위치 | Fields | 용도 |
|--------|------|--------|------|
| BaseTimeEntity | `global/entity/` | `createdAt` (DATETIME(6), immutable), `updatedAt` (DATETIME(6), auto) | 모든 JPA 엔티티의 부모 클래스 |

### Common DTOs

| 클래스 | 위치 | 타입 | Fields | 용도 |
|--------|------|------|--------|------|
| PageResponse\<T\> | `global/dto/` | record (Generic) | `content`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`, `isLast` | 페이지네이션 응답 래퍼. `PageResponse.from(Page<T>)` |
| ErrorResponse | `global/exception/` | record | `code`, `message`, `timestamp`, `errors` (nullable FieldError 리스트) | 표준 에러 응답 |

### Configuration

| 클래스 | 위치 | 용도 |
|--------|------|------|
| SecurityConfig | `global/config/` | Spring Security 필터 체인, CORS, URL 패턴 |
| JpaAuditingConfig | `global/config/` | @CreatedDate, @LastModifiedDate 자동 생성 |
| JwtProperties | `global/config/` | JWT 설정 (secret, TTL) |
| CacheConfig | `global/config/` | Caffeine 캐시 (storeSummary: 10분 TTL) |
| SpringDocConfig | `global/config/` | Swagger/OpenAPI 메타데이터, 보안 스키마 |

### Domain Enums

#### 상태 Enum

| Enum | 패키지 | 값 | 전이 |
|------|--------|---|------|
| StampCardStatus | `stampcard/domain/` | DRAFT, ACTIVE, ARCHIVED | DRAFT→(ACTIVE\|ARCHIVED); ACTIVE→ARCHIVED; ARCHIVED→(없음) |
| IssuanceRequestStatus | `issuance/domain/` | PENDING, APPROVED, REJECTED, EXPIRED | PENDING→(APPROVED\|REJECTED) or EXPIRED |
| StampMigrationStatus | `migration/domain/` | SUBMITTED, APPROVED, REJECTED, CANCELED | SUBMITTED→(APPROVED\|REJECTED\|CANCELED) |
| WalletRewardStatus | `wallet/domain/` | AVAILABLE, REDEEMED, EXPIRED | AVAILABLE→REDEEMED or EXPIRED |
| WalletStampCardStatus | `wallet/domain/` | ACTIVE, COMPLETED | ACTIVE→COMPLETED |
| StoreStatus | `store/domain/` | DRAFT, LIVE, SUSPENDED, DELETED | DRAFT→LIVE(Admin 승인), LIVE↔SUSPENDED, →DELETED(소프트 삭제, 최종) |
| CustomerWalletStatus | `wallet/domain/` | ACTIVE, BLOCKED | ACTIVE↔BLOCKED |

#### 이벤트/타입 Enum

| Enum | 패키지 | 값 | 용도 |
|------|--------|---|------|
| StampEventType | `stamp/domain/` | ISSUED, MIGRATED, MANUAL_ADJUST | 스탬프 이력 분류 |
| StampCardDesignType | `stampcard/domain/` | COLOR, IMAGE, PUZZLE | 카드 디자인 템플릿 |
| StampCardSortType | `wallet/domain/` | LAST_STAMPED, CREATED, PROGRESS | 지갑 카드 정렬 |
| StoreAuditAction | `store/domain/` | CREATED, STATUS_CHANGED, UPDATED, DELETED | 매장 감사 로그 액션 |
| PerformerType | `store/domain/` | OWNER, ADMIN, SYSTEM | 감사 로그 수행자 유형 |
| TokenType | `global/security/` | OWNER, CUSTOMER, STEPUP | JWT 토큰 분류 |

### ErrorCode (전체 목록)

| HTTP | Code | Category | Message |
|------|------|----------|---------|
| 400 | INVALID_INPUT_VALUE | Common | 입력값이 올바르지 않습니다 |
| 500 | INTERNAL_SERVER_ERROR | Common | 서버 오류가 발생했습니다 |
| 500 | FILE_STORAGE_ERROR | Common | 파일 저장 중 오류가 발생했습니다 |
| 500 | QR_GENERATION_FAILED | Common | QR 코드 생성 중 오류가 발생했습니다 |
| 401 | UNAUTHORIZED | Auth | 인증이 필요합니다 |
| 403 | ACCESS_DENIED | Auth | 접근 권한이 없습니다 |
| 409 | OWNER_EMAIL_DUPLICATED | Auth | 이미 사용 중인 이메일입니다 |
| 409 | OWNER_LOGIN_ID_DUPLICATED | Auth | 이미 사용 중인 로그인 ID입니다 |
| 401 | OWNER_LOGIN_FAILED | Auth | 이메일 또는 비밀번호가 올바르지 않습니다 |
| 404 | STAMP_CARD_NOT_FOUND | StampCard | 스탬프 카드를 찾을 수 없습니다 |
| 409 | STAMP_CARD_ALREADY_ACTIVE | StampCard | 이미 활성화된 스탬프 카드가 존재합니다 |
| 400 | STAMP_CARD_STATUS_INVALID | StampCard | 유효하지 않은 상태 전이입니다 |
| 400 | STAMP_CARD_DELETE_NOT_ALLOWED | StampCard | 초안 상태의 스탬프 카드만 삭제할 수 있습니다 |
| 403 | STAMP_CARD_ACCESS_DENIED | StampCard | 해당 스탬프 카드에 대한 접근 권한이 없습니다 |
| 400 | STAMP_CARD_UPDATE_NOT_ALLOWED | StampCard | 활성 상태에서는 일부 필드만 수정할 수 있습니다 |
| 404 | STORE_NOT_FOUND | Store | 매장을 찾을 수 없습니다 |
| 403 | STORE_INACTIVE | Store | 해당 매장은 현재 이용할 수 없습니다 |
| 403 | STORE_ACCESS_DENIED | Store | 매장 접근 권한이 없습니다 |
| 404 | ISSUANCE_REQUEST_NOT_FOUND | Issuance | 적립 요청을 찾을 수 없습니다 |
| 400 | ISSUANCE_REQUEST_NOT_PENDING | Issuance | 처리 대기 중인 요청이 아닙니다 |
| 409 | ISSUANCE_REQUEST_ALREADY_PENDING | Issuance | 이미 대기 중인 적립 요청이 있습니다 |
| 409 | ISSUANCE_ALREADY_PROCESSED | Issuance | 이미 처리된 요청입니다 |
| 410 | ISSUANCE_REQUEST_EXPIRED | Issuance | 요청이 만료되었습니다 |
| 429 | OTP_RATE_LIMIT_EXCEEDED | OTP | OTP 요청 제한을 초과했습니다 |
| 401 | OTP_EXPIRED | OTP | OTP가 만료되었습니다 |
| 401 | OTP_INVALID | OTP | OTP가 일치하지 않습니다 |
| 401 | OTP_ATTEMPTS_EXCEEDED | OTP | OTP 시도 횟수를 초과했습니다 |
| 409 | WALLET_PHONE_DUPLICATED | Wallet | 이미 등록된 전화번호입니다 |
| 409 | WALLET_NICKNAME_DUPLICATED | Wallet | 이미 사용 중인 닉네임입니다 |
| 404 | CUSTOMER_WALLET_NOT_FOUND | Wallet | 해당 전화번호와 이름으로 지갑을 찾을 수 없습니다 |
| 403 | CUSTOMER_WALLET_BLOCKED | Wallet | 차단된 지갑입니다 |
| 404 | WALLET_STAMP_CARD_NOT_FOUND | Wallet | 해당 지갑 스탬프카드를 찾을 수 없습니다 |
| 403 | WALLET_STAMP_CARD_ACCESS_DENIED | Wallet | 다른 고객의 스탬프카드에 접근할 수 없습니다 |
| 403 | STEPUP_REQUIRED | Redeem | OTP 인증이 필요합니다 |
| 404 | REWARD_NOT_FOUND | Redeem | 리워드를 찾을 수 없습니다 |
| 409 | REWARD_NOT_AVAILABLE | Redeem | 사용 가능한 리워드가 아닙니다 |
| 410 | REWARD_EXPIRED | Redeem | 리워드 유효기간이 만료되었습니다 |
| 404 | MIGRATION_NOT_FOUND | Migration | 마이그레이션 요청을 찾을 수 없습니다 |
| 409 | MIGRATION_ALREADY_PENDING | Migration | 이미 처리 중인 마이그레이션 요청이 있습니다 |
| 409 | MIGRATION_ALREADY_PROCESSED | Migration | 이미 처리된 마이그레이션 요청입니다 |
| 403 | MIGRATION_ACCESS_DENIED | Migration | 다른 고객의 마이그레이션 요청에 접근할 수 없습니다 |
| 413 | MIGRATION_IMAGE_TOO_LARGE | Migration | 이미지 크기가 너무 큽니다 (최대 5MB) |
| 409 | NO_ACTIVE_STAMP_CARD | StampCard | 활성 스탬프 카드가 없습니다 |
| 400 | STORE_STATUS_TRANSITION_INVALID | Store | 유효하지 않은 매장 상태 전이입니다 |
| 409 | STORE_PLACE_REF_DUPLICATED | Store | 이미 등록된 장소 참조입니다 |
| 413 | STORE_ICON_TOO_LARGE | Store | 아이콘 이미지가 너무 큽니다 |
| 400 | STORE_PHONE_INVALID | Store | 매장 전화번호 형식이 올바르지 않습니다 |
| 403 | STORE_NOT_OPERATIONAL | Store | 매장이 운영 중이 아닙니다 |
| 403 | ADMIN_ACCESS_DENIED | Admin | 관리자 접근 권한이 없습니다 |
| 500 | KAKAO_API_ERROR | External | 카카오 API 호출 중 오류가 발생했습니다 |

---

## Frontend

### API Layer (`frontend/src/lib/api/`)

| 파일 | Export | 용도 |
|------|--------|------|
| client.ts | `apiClient` | Axios 인스턴스 (30s timeout, Bearer 토큰 자동 주입) |
| client.ts | `getRaw<T>()`, `postRaw<T,D>()`, `putRaw<T,D>()`, `patchRaw<T,D>()`, `delRaw<T>()` | HTTP 헬퍼 함수 |
| endpoints.ts | `API_ENDPOINTS` | 역할별 URL 상수 (PUBLIC, CUSTOMER, OWNER) |
| endpoints.ts | `QUERY_KEYS` | TanStack Query 캐시 키 팩토리 |
| tokenManager.ts | `setAuthToken()`, `getAuthToken()`, `clearAuthToken()` | Auth 토큰 관리 |
| tokenManager.ts | `setStepUpToken()`, `getStepUpToken()`, `isStepUpValid()`, `getStepUpRemainingSeconds()` | StepUp 토큰 관리 (10분 TTL) |
| tokenManager.ts | `setUserInfo()`, `getUserInfo()`, `getTokenType()` | 사용자 메타데이터 |
| tokenManager.ts | `isAuthenticated()`, `isCustomer()`, `isOwner()`, `logout()` | 인증 상태 체크 |

### Utility Functions (`frontend/src/lib/utils/`)

| 파일 | 함수 | Input | Output | 용도 |
|------|------|-------|--------|------|
| cn.ts | `cn()` | ...ClassValue[] | string | Tailwind 클래스 병합 (clsx + tailwind-merge) |
| format.ts | `formatTime()` | Date/string/number | "14:30" | 시간 HH:MM |
| format.ts | `formatDate()` | Date/string/number | "2월 10일" | 날짜 M월 D일 |
| format.ts | `formatDateTime()` | Date/string/number | "2월 10일 14:30" | 날짜+시간 |
| format.ts | `formatFullDateTime()` | Date/string/number | "2월 10일 14:30" | 날짜+시간 (long) |
| format.ts | `formatShortDate()` | Date/string/number | "2026.02.10" | YYYY.MM.DD |
| format.ts | `maskPhone()` | string | "010-\*\*\*\*-5678" | 전화번호 마스킹 |
| format.ts | `stripPhoneToDigits()` | string | "01012345678" | 전화번호에서 숫자만 추출 |
| format.ts | `formatPhoneNumber()` | string | "010-1234-5678" | 전화번호 자동 포맷 (3-4-4) |
| format.ts | `hasInvalidPhoneChars()` | string | boolean | 전화번호 입력에 잘못된 문자 포함 여부 |
| format.ts | `formatCountdown()` | number (seconds) | "05:30" | MM:SS 카운트다운 |
| format.ts | `formatRelativeTime()` | Date/string/number | "2시간 전" | 상대 시간 |
| format.ts | `formatNumber()` | number | "1,234,567" | 천단위 구분 |
| format.ts | `formatPercent()` | value, total | 75 | 백분율 계산 |

### Custom Hooks (주요)

#### Global (`frontend/src/hooks/`)

| Hook | 용도 |
|------|------|
| `useAuthContext()` | 현재 인증 컨텍스트 |
| `useCustomerNavigate()` | 고객 라우트 네비게이션 |
| `useStorePublicInfo()` | 매장 공개 정보 조회 |

#### Auth (`frontend/src/features/auth/hooks/`)

| Hook | 타입 | 용도 |
|------|------|------|
| `useOtpRequest()` | mutation | OTP 코드 요청 |
| `useOtpVerify()` | mutation | OTP 검증 + StepUp 토큰 |
| `useWalletRegister()` | mutation | 고객 지갑 등록 |
| `useWalletLogin()` | mutation | 고객 로그인 |
| `useOwnerSignup()` | mutation | 사장님 회원가입 |
| `useOwnerLogin()` | mutation | 사장님 로그인 |
| `useLogout()` | mutation | 로그아웃 |

#### Wallet (`frontend/src/features/wallet/hooks/`)

| Hook | 타입 | StepUp | 용도 |
|------|------|--------|------|
| `useWalletStampCards()` | query | 불필요 | 내 스탬프카드 목록 |
| `useStoreSummary()` | query | 불필요 | 매장+활성 카드 정보 |
| `useStampHistory()` | query | 필요 | 스탬프 적립 이력 |
| `useStampHistoryInfinite()` | infiniteQuery | 필요 | 무한 스크롤 스탬프 이력 |
| `useRedeemHistory()` | query | 필요 | 리딤 사용 이력 |
| `useRedeemHistoryInfinite()` | infiniteQuery | 필요 | 무한 스크롤 리딤 이력 |
| `useWalletRewards()` | query | 필요 | 리워드/쿠폰함 |
| `useWalletRewardsInfinite()` | infiniteQuery | 필요 | 무한 스크롤 리워드 |

#### Feature Hooks

| Hook | 패키지 | 용도 |
|------|--------|------|
| `useIssuance()` | `features/issuance/hooks/` | 적립 요청 + 폴링 |
| `useRedeem()` | `features/redemption/hooks/` | 리딤 세션 생성/완료 |
| `useMigration()` | `features/migration/hooks/` | 마이그레이션 요청/조회 |
| `useOwnerMigration()` | `features/migration/hooks/` | 마이그레이션 승인/거절 |
| `useStore()` | `features/store-management/hooks/` | 매장 CRUD |
| `useStampCard()` | `features/stampcard/hooks/` | 스탬프카드 CRUD |
| `useApproval()` | `features/store-management/hooks/` | 적립 승인/거절 (Owner 백오피스) |
| `useAdminStores()` | `features/admin/hooks/` | 관리자 매장 목록 (status 필터) |
| `useAdminStoreDetail()` | `features/admin/hooks/` | 관리자 매장 상세 |
| `useAdminStoreStatusChange()` | `features/admin/hooks/` | 관리자 매장 상태 변경 |
| `useAdminStoreAuditLogs()` | `features/admin/hooks/` | 관리자 매장 Audit Log |

### UI Components (`frontend/src/components/ui/`)

| 컴포넌트 | Variants | 특징 |
|---------|----------|------|
| Button | primary, secondary, navy, outline, ghost, destructive, link, subtle | CVA 스타일링, 로딩 스피너, Radix Slot |
| Input | - | 좌측 아이콘, 에러 메시지, 커스텀 라벨 |
| Badge | default, primary, secondary, success, warning, destructive, navy, outline | 도트 인디케이터 |
| Dialog | DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose | Radix 기반, 페이드/줌 애니메이션 |

### Feature Components

| 컴포넌트 | 패키지 | 용도 |
|---------|--------|------|
| StoreStatusBadge | `features/store-management/components/` | 매장 상태 뱃지 (DRAFT/LIVE/SUSPENDED/DELETED 컬러 표시) |
| IconUpload | `features/store-management/components/` | 매장 아이콘 이미지 업로드 (Base64 변환) |
| PlaceSearchInput | `features/store-management/components/` | 카카오 장소 검색 입력 (자동완성, placeRef 선택) |

### Shared Components (`frontend/src/components/shared/`)

| 컴포넌트 | Props | 용도 |
|---------|-------|------|
| LauncherCard | icon, title, desc, onClick, color | 홈 화면 피처 카드 |
| MenuLink | icon, label, onClick, isActive | 네비게이션 메뉴 링크 |
| StepUpVerify | onVerified | 인라인 OTP 인증 흐름 |
| ScrollToTop | - | 스크롤 상단 이동 |

### Type Definitions (`frontend/src/types/`)

| 파일 | 주요 타입 | 용도 |
|------|----------|------|
| api.ts | ErrorResponse, PageResponse\<T\>, OTP DTOs, Wallet DTOs, Issuance DTOs, Redeem DTOs, Migration DTOs, Owner DTOs, Store DTOs, StampCard DTOs, Approval DTOs, Statistics DTOs | API Request/Response 타입 (70+) |
| domain.ts | StampCard, Reward, IssuanceRequest, MigrationRequest, Store, CustomerWallet, OwnerAccount, StoreStats, RedeemSession, StampCardDesign | 프론트엔드 도메인 모델 (25+) |
