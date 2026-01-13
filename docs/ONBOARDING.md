# KKOOKK 온보딩 가이드

이 문서는 KKOOKK 프로젝트의 구현된 코드를 리뷰하고 이해하기 위한 가이드입니다.

## 목차
1. [프로젝트 빠른 시작](#프로젝트-빠른-시작)
2. [아키텍처 개요](#아키텍처-개요)
3. [기능별 코드 리뷰 가이드](#기능별-코드-리뷰-가이드)
4. [핵심 패턴 및 설계](#핵심-패턴-및-설계)
5. [테스트 및 검증](#테스트-및-검증)
6. [API 문서 활용](#api-문서-활용)

---

## 프로젝트 빠른 시작

### 실행 방법

**개발 환경 (클라이언트/서버 분리):**
```bash
# Terminal 1 - 백엔드
cd server
./gradlew bootRun

# Terminal 2 - 프론트엔드
cd client
npm install
npm run dev
```

**프로덕션 빌드 (단일 JAR):**
```bash
# Windows
build.bat
run.bat

# Linux/Mac
./build.sh
./run.sh
```

### 주요 접속 URL
- **프론트엔드 개발 서버**: http://localhost:5173 (또는 5174)
- **백엔드 API 서버**: http://localhost:8080
- **Swagger API 문서**: http://localhost:8080/swagger-ui/index.html
- **H2 Database Console**: http://localhost:8080/h2-console

---

## 아키텍처 개요

### 전체 구조
```
digital-stamp-service/
├── server/          # Spring Boot 백엔드
│   └── src/main/java/com/kkookk/
│       ├── auth/           # JWT 인증
│       ├── owner/          # 오너 계정/매장 관리
│       ├── customer/       # 고객 지갑/세션 관리
│       ├── stampcard/      # 스탬프 카드 설정
│       ├── issuance/       # 스탬프 적립 요청/승인
│       ├── redemption/     # 리워드 사용
│       ├── migration/      # 종이 스탬프 이전
│       └── common/         # 공통 유틸/설정
└── client/          # React 프론트엔드
    └── src/
        ├── api/            # API 클라이언트
        ├── pages/          # 페이지 컴포넌트
        ├── components/     # 재사용 컴포넌트
        └── contexts/       # React Context
```

### 기술 스택 요약
- **Backend**: Java 17, Spring Boot 3.x, Spring Data JPA, JWT, H2/MySQL
- **Frontend**: React 18, TypeScript, Vite, TanStack Query, MUI, React Hook Form + Zod
- **Real-time**: Polling 기반 (2-3초 간격)
- **Deployment**: 단일 JAR 배포 (프론트엔드 static 파일 내장)

---

## 기능별 코드 리뷰 가이드

### 1. 인증 시스템 (Authentication)

#### 리뷰 포인트
**오너 인증 (JWT)**
- `server/src/main/java/com/kkookk/auth/`
  - `JwtService.java`: JWT 생성/검증 로직
  - `AuthController.java`: 로그인/회원가입 API
- 확인사항:
  - [ ] JWT 시크릿 키가 하드코딩되지 않았는가?
  - [ ] Access Token만 사용하고 Refresh Token은 없는가? (MVP 스펙)
  - [ ] 토큰 만료 시간이 적절한가?

**고객 세션 (Wallet Session)**
- `server/src/main/java/com/kkookk/customer/`
  - `CustomerSession.java`: 세션 엔티티 (FULL/VIEW scope)
  - `SessionService.java`: 세션 생성/검증
- 확인사항:
  - [ ] OTP 검증 후 `otpVerifiedUntil` 업데이트 확인 (10분 유효)
  - [ ] VIEW scope 세션은 읽기만 가능한가?
  - [ ] FULL scope 세션만 적립/사용 가능한가?

**프론트엔드 인증 관리**
- `client/src/api/client.ts`: Axios 인터셉터
- 확인사항:
  - [ ] JWT는 `Authorization: Bearer` 헤더로 전송되는가?
  - [ ] 세션 토큰은 `X-Wallet-Session` 헤더로 전송되는가?
  - [ ] 401 에러 시 로그인 페이지로 리다이렉트되는가?

---

### 2. 스탬프 적립 플로우 (Issuance)

#### 핵심 파일
**Backend:**
- `server/src/main/java/com/kkookk/issuance/`
  - `IssuanceRequest.java`: 적립 요청 엔티티 (TTL: 90초)
  - `IssuanceService.java`: 요청 생성/승인/거부 로직
  - `StampEvent.java`: 이벤트 로그 (ISSUED, MIGRATED, MANUAL_ADJUST)

**Frontend:**
- `client/src/pages/IssuanceRequestPage.tsx`: 고객 요청 화면
- `client/src/pages/IssuanceWaitPage.tsx`: 대기 화면 (폴링 + 타이머)
- `client/src/pages/OwnerTerminalPage.tsx`: 오너 승인 터미널

#### 리뷰 체크리스트

**1. 요청 생성 시 (고객)**
```java
// IssuanceService.java - createIssuanceRequest()
```
- [ ] `clientRequestId`로 중복 요청 방지 (idempotency)
- [ ] TTL 90초 설정 확인
- [ ] 세션 scope가 FULL인지 검증
- [ ] StampCard가 ACTIVE 상태인지 확인

**2. 요청 승인 시 (오너)**
```java
// IssuanceService.java - approveRequest()
```
- [ ] 요청 상태가 PENDING인지 확인
- [ ] 만료 시간 체크 (expiresAt)
- [ ] `WalletStampCard.stampCount` 증가
- [ ] `StampEvent` 이벤트 로그 생성
- [ ] **자동 리워드 발급**: stampCount가 stampGoal 도달 시 `issueReward()` 호출
- [ ] 중복 리워드 방지 확인

**3. 폴링 구현 (프론트엔드)**
```typescript
// IssuanceWaitPage.tsx
const { data: request } = useQuery({
  refetchInterval: (data) => {
    if (data?.status === 'PENDING') return 2000;
    return false;
  }
});
```
- [ ] PENDING 상태일 때만 2초마다 폴링
- [ ] APPROVED/REJECTED/EXPIRED 시 폴링 중단
- [ ] 남은 시간 카운트다운 표시
- [ ] 네트워크 에러 처리

**4. 이벤트 소싱 패턴**
```java
StampEvent event = StampEvent.builder()
    .eventType(StampEventType.ISSUED)
    .stampDelta(1)
    .requestId(request.getClientRequestId())
    .build();
```
- [ ] 모든 적립 액션에 대해 `StampEvent` 생성
- [ ] `stampDelta`, `requestId`, `notes` 필드 확인
- [ ] `WalletStampCard.stampCount`는 캐시, 이벤트가 source of truth

---

### 3. 리워드 사용 플로우 (Redemption)

#### 핵심 파일
**Backend:**
- `server/src/main/java/com/kkookk/redemption/`
  - `RewardInstance.java`: 발급된 리워드 (AVAILABLE/USED/EXPIRED)
  - `RedeemSession.java`: 사용 세션 (TTL: 45초)
  - `RedemptionService.java`: 세션 생성 및 완료 로직
  - `RedeemEvent.java`: 사용 이벤트 로그

**Frontend:**
- `client/src/pages/MyRewardsPage.tsx`: 내 리워드 목록
- `client/src/pages/RedemptionPage.tsx`: 사용 확인 화면

#### 리뷰 체크리스트

**1. OTP Step-up 인증**
```java
// RedemptionService.java - createRedeemSession()
if (session.getOtpVerifiedUntil() == null ||
    session.getOtpVerifiedUntil().isBefore(LocalDateTime.now())) {
    throw new BusinessException(ErrorCode.OTP_VERIFICATION_REQUIRED);
}
```
- [ ] 리워드 사용 전 반드시 OTP 재검증 필요
- [ ] `otpVerifiedUntil` 10분 유효기간 확인
- [ ] OTP 검증 없이 사용 불가능

**2. 사용 세션 생성**
```java
RedeemSession redeemSession = RedeemSession.builder()
    .sessionToken(UUID.randomUUID().toString())
    .expiresAt(LocalDateTime.now().plusSeconds(45))
    .build();
```
- [ ] 45초 TTL 설정
- [ ] RewardInstance 상태가 AVAILABLE인지 확인
- [ ] 만료 시간 체크

**3. 2-Factor 확인 모달 (프론트엔드)**
```typescript
// RedemptionPage.tsx
const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

// "사용 처리" 버튼 → 확인 모달 → "확인" 버튼 → API 호출
```
- [ ] 사용 버튼 클릭 시 즉시 API 호출하지 않음
- [ ] 경고 메시지: "되돌릴 수 없습니다. 매장과 확인하세요."
- [ ] 확인 후에만 `completeRedemption()` 호출

**4. Idempotency (중복 방지)**
```java
// RedemptionService.java - completeRedemption()
if (redeemSession.isCompleted()) {
    // 이미 완료된 경우 기존 결과 반환
    return toResponse(redeemSession);
}
```
- [ ] 동일 세션으로 여러 번 호출 시 중복 처리 방지
- [ ] `RedeemEvent`는 한 번만 생성
- [ ] `RewardInstance.status`는 한 번만 USED로 변경

---

### 4. 종이 스탬프 이전 (Migration)

#### 핵심 파일
**Backend:**
- `server/src/main/java/com/kkookk/migration/`
  - `StampMigrationRequest.java`: 이전 요청 (SUBMITTED/APPROVED/REJECTED)
  - `MigrationService.java`: 요청 처리 로직
- `server/src/main/java/com/kkookk/common/service/FileStorageService.java`: 파일 업로드

**Frontend:**
- `client/src/pages/StampMigrationPage.tsx`: 고객 사진 업로드
- `client/src/pages/OwnerMigrationPage.tsx`: 오너 검토/승인

#### 리뷰 체크리스트

**1. 파일 업로드 보안**
```java
// FileStorageService.java
private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```
- [ ] 파일 크기 제한 (10MB)
- [ ] 파일 확장자 검증 (이미지만 허용)
- [ ] 파일명 중복 방지 (UUID 사용)
- [ ] 로컬 파일 시스템 저장 (`/uploads` 폴더)

**2. 승인 처리**
```java
// MigrationService.java - approveRequest()
walletStampCard.setStampCount(walletStampCard.getStampCount() + approvedCount);

StampEvent event = StampEvent.builder()
    .eventType(StampEventType.MIGRATED)
    .stampDelta(approvedCount)
    .build();
```
- [ ] 오너가 입력한 `approvedCount`만큼 스탬프 증가
- [ ] `MIGRATED` 타입 이벤트 로그 생성
- [ ] 리워드 자동 발급 로직 트리거 확인
- [ ] 지갑당 매장당 1회 제한 확인

**3. 수동 검토 프로세스**
- [ ] OCR/AI 없음 (MVP 스펙)
- [ ] 오너가 사진 보고 수동으로 개수 입력
- [ ] 반려 시 `rejectReason` 저장
- [ ] 고객이 반려 이유 확인 가능

---

### 5. 로그 및 감사 (Logging & Audit)

#### 핵심 파일
**Backend:**
- `server/src/main/java/com/kkookk/common/service/LogService.java`
  - `getStampLogs()`: 스탬프 이벤트 조회
  - `getRedeemLogs()`: 리워드 사용 이벤트 조회
  - `getAllLogs()`: 통합 조회

**Frontend:**
- `client/src/pages/OwnerLogsPage.tsx`: 로그 조회 화면 (탭, 필터)

#### 리뷰 체크리스트

**1. 이벤트 로그 필수 필드**
```java
StampEvent / RedeemEvent
- walletId, storeId, stampCardId
- createdAt (자동 생성)
- requestId / sessionToken (추적용)
- notes (선택적)
```
- [ ] 모든 적립/사용 액션에 대해 이벤트 생성
- [ ] Foreign Key 관계 확인
- [ ] 이벤트는 불변(immutable) - 수정/삭제 불가

**2. 로그 조회 필터**
```java
// LogService.java
.filter(e -> storeId == null || e.getStore().getId().equals(storeId))
.filter(e -> walletId == null || e.getWallet().getId().equals(walletId))
.filter(e -> from == null || e.getCreatedAt().isAfter(from))
```
- [ ] 매장별 필터
- [ ] 고객(지갑)별 필터
- [ ] 날짜 범위 필터
- [ ] 이벤트 타입 필터 (스탬프/리워드)

**3. 성능 고려사항**
- [ ] 현재는 `findAll()` 후 메모리 필터링 (MVP)
- [ ] TODO: 쿼리 최적화 필요 (Specification 또는 QueryDSL)
- [ ] 페이징 미구현 (향후 추가 필요)

---

## 핵심 패턴 및 설계

### 1. TTL (Time-To-Live) 패턴

```java
// 모든 임시 세션/요청은 TTL 적용
@Column(nullable = false)
private LocalDateTime expiresAt;

// 생성 시
.expiresAt(LocalDateTime.now().plusSeconds(90))

// 검증 시
if (request.getExpiresAt().isBefore(LocalDateTime.now())) {
    throw new BusinessException(ErrorCode.REQUEST_EXPIRED);
}
```

**적용 대상:**
- `IssuanceRequest`: 90초
- `RedeemSession`: 45초
- `CustomerSession.otpVerifiedUntil`: 10분

**리뷰 포인트:**
- [ ] 만료 시간 체크 로직이 모든 API에 존재
- [ ] 프론트엔드에서 카운트다운 표시
- [ ] 만료 시 적절한 에러 메시지 (410 Gone)

---

### 2. Idempotency (멱등성) 패턴

```java
// clientRequestId로 중복 방지
@Column(nullable = false, unique = true)
private String clientRequestId;

// 서비스 로직
Optional<IssuanceRequest> existing = repository.findByClientRequestId(clientRequestId);
if (existing.isPresent()) {
    return toResponse(existing.get()); // 기존 요청 반환
}
```

**적용 대상:**
- `IssuanceRequest.clientRequestId`
- `RedeemSession.sessionToken`

**리뷰 포인트:**
- [ ] 중복 요청 시 새로 생성하지 않고 기존 결과 반환
- [ ] 네트워크 재시도 시 안전
- [ ] DB Unique Constraint 확인

---

### 3. Event Sourcing (이벤트 소싱)

```java
// 상태 변경 시 이벤트 로그 생성
StampEvent event = StampEvent.builder()
    .wallet(wallet)
    .store(store)
    .stampCard(stampCard)
    .eventType(StampEventType.ISSUED)
    .stampDelta(1)
    .requestId(clientRequestId)
    .build();
stampEventRepository.save(event);

// 집계 값 업데이트 (캐시)
walletStampCard.setStampCount(walletStampCard.getStampCount() + 1);
```

**핵심 개념:**
- `StampEvent`/`RedeemEvent`가 **Source of Truth**
- `WalletStampCard.stampCount`는 **캐시/집계 값**
- 분쟁 시 이벤트 로그 기반으로 재계산 가능

**리뷰 포인트:**
- [ ] 모든 상태 변경에 이벤트 생성
- [ ] 이벤트는 불변 (수정/삭제 금지)
- [ ] 집계 값과 이벤트 합계가 일치하는지 검증 로직 필요 (향후)

---

### 4. Polling 패턴 (Real-time Communication)

```typescript
// TanStack Query의 refetchInterval 활용
const { data, refetch } = useQuery({
  queryKey: ['issuance', requestId],
  queryFn: () => api.getRequest(requestId),
  refetchInterval: (data) => {
    if (data?.status === 'PENDING') {
      return 2000; // 2초마다 폴링
    }
    return false; // 폴링 중단
  }
});
```

**적용 화면:**
- 고객 대기 화면: `IssuanceWaitPage`, `RedemptionPage`
- 오너 터미널: `OwnerTerminalPage`

**리뷰 포인트:**
- [ ] 상태 완료 시 자동으로 폴링 중단
- [ ] 네트워크 에러 시 재시도 UI
- [ ] 폴링 간격이 적절한가? (너무 짧으면 서버 부하)

---

### 5. 에러 처리 (Error Handling)

#### Backend
```java
// GlobalExceptionHandler.java
@ExceptionHandler(BusinessException.class)
public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
    return ResponseEntity
        .status(e.getErrorCode().getStatus())
        .body(new ErrorResponse(
            e.getErrorCode().getCode(),    // "C001"
            e.getErrorCode().getMessage(), // "적립 요청이 만료되었습니다"
            null
        ));
}
```

**에러 코드 체계:**
- `A0xx`: Auth 관련
- `C0xx`: Customer 관련
- `I0xx`: Issuance 관련
- `R0xx`: Redemption 관련
- `M0xx`: Migration 관련

#### Frontend
```typescript
// api/client.ts - Axios Interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || '오류가 발생했습니다';
    showToast(errorMessage, 'error');
    return Promise.reject(error);
  }
);
```

**리뷰 포인트:**
- [ ] 모든 비즈니스 에러는 `BusinessException`으로 통일
- [ ] HTTP 상태 코드 일관성 (400, 401, 404, 409, 410, 429)
- [ ] 프론트엔드에서 에러 메시지 토스트로 표시
- [ ] 사용자 친화적 에러 메시지

---

## 테스트 및 검증

### Backend 통합 테스트

**위치:** `server/src/test/java/com/kkookk/integration/`

#### 1. IssuanceFlowTest
```java
testIssuanceFlow_createRequest_ownerApproves_stampCountIncreases_eventLogged()
```
**검증 항목:**
- [ ] 요청 생성 → PENDING 상태
- [ ] 오너 승인 → APPROVED 상태
- [ ] `stampCount` +1 증가
- [ ] `StampEvent` 생성 확인
- [ ] 자동 리워드 발급 확인 (goal 도달 시)

#### 2. RedemptionFlowTest
```java
testRedemptionFlow_stepUpValid_createSession_complete_rewardUsed_eventLogged_idempotent()
```
**검증 항목:**
- [ ] OTP step-up 검증
- [ ] 세션 생성 → 45초 TTL
- [ ] 사용 완료 → reward.status = USED
- [ ] `RedeemEvent` 생성 확인
- [ ] Idempotency: 중복 호출 시 동일 결과

#### 3. MigrationFlowTest
```java
testMigrationFlow_submitRequest_ownerApproves_stampCountIncreases_eventLogged()
```
**검증 항목:**
- [ ] 사진 업로드 → 요청 생성
- [ ] 오너 승인 → `stampCount` +5
- [ ] `StampEvent` (MIGRATED) 생성
- [ ] 리워드 자동 발급 확인

**실행:**
```bash
cd server
./gradlew test
```

---

### Frontend 스모크 테스트

**위치:** `client/src/pages/*.test.tsx`

#### 1. CustomerLandingPage.test.tsx
```typescript
it('should render store and stamp card information')
```
- [ ] 매장 정보 렌더링
- [ ] 스탬프 카드 정보 렌더링
- [ ] API 모킹 확인

#### 2. IssuanceWaitPage.test.tsx
```typescript
it('should show waiting UI and countdown timer')
```
- [ ] 대기 중 메시지 표시
- [ ] 카운트다운 타이머
- [ ] 폴링 로직 (모킹)

#### 3. RedemptionPage.test.tsx
```typescript
it('should show confirmation modal before completing redemption')
```
- [ ] 확인 모달 렌더링
- [ ] "확인" 버튼 클릭 시 API 호출
- [ ] 2-factor 확인 플로우

**실행:**
```bash
cd client
npm run test
```

---

### 수동 테스트 시나리오

#### E2E 플로우 테스트

**1. 오너 → 매장 생성 → 스탬프 카드 설정**
```
1. http://localhost:5173/owner/register → 회원가입
2. 로그인 → /owner/stores → "새 매장 추가"
3. 매장 정보 입력 (이름, 주소 등)
4. StampCard 생성: 목표 5개, 리워드 "아메리카노"
```

**2. 고객 → 지갑 등록 → 스탬프 적립**
```
1. http://localhost:5173/s/1 (storeId=1)
2. "지갑 등록" → 전화번호, 이름, 닉네임 입력
3. OTP 입력 (DEV 모드: "123456")
4. "스탬프 받기" → IssuanceRequest 생성
5. 90초 카운트다운 확인
```

**3. 오너 → 터미널에서 승인**
```
1. http://localhost:5173/owner/terminal
2. Pending 요청 목록 확인 (2초마다 폴링)
3. 고객 정보 확인 후 "승인" 클릭
4. 고객 화면에서 자동으로 "승인됨" 상태로 변경 확인
```

**4. 고객 → 리워드 사용**
```
1. 스탬프 5개 모으면 자동으로 리워드 발급
2. /wallet/rewards → 사용 가능한 리워드 확인
3. "사용하기" → OTP 재검증 (step-up)
4. "사용 처리" → 확인 모달 → "확인"
5. RedemptionPage에서 45초 타이머와 함께 확인 화면
6. "이 작업은 되돌릴 수 없습니다" 경고 확인
7. "확인" → 사용 완료
```

**5. 오너 → 로그 확인**
```
1. http://localhost:5173/owner/logs
2. "전체" 탭: 스탬프 + 리워드 이벤트 확인
3. "스탬프만" 탭: ISSUED 이벤트 확인
4. "리워드만" 탭: REDEEMED 이벤트 확인
5. 매장, 날짜 필터 테스트
```

---

## API 문서 활용

### Swagger UI 사용법

**접속:** http://localhost:8080/swagger-ui/index.html

#### 1. JWT 인증 테스트
```
1. POST /api/auth/login → ownerToken 복사
2. 우측 상단 "Authorize" 클릭
3. "Bearer Authentication" 필드에 토큰 입력 (Bearer 제외)
4. "Authorize" 클릭
5. 이제 모든 오너 API 호출 가능
```

#### 2. 고객 세션 테스트
```
1. POST /api/wallet/register → sessionToken 복사
2. "Authorize" → "Wallet Session" 필드에 토큰 입력
3. GET /api/wallet/my-cards → 내 스탬프 카드 조회
```

#### 3. 주요 API 그룹

**Public APIs (인증 불필요)**
- `GET /api/public/stores/{id}`: 매장 정보 조회
- `GET /api/public/stores/{id}/active-card`: 활성 스탬프 카드 조회

**Auth APIs**
- `POST /api/auth/register`: 오너 회원가입
- `POST /api/auth/login`: 오너 로그인

**Owner APIs (JWT 필요)**
- `GET /api/owner/stores`: 내 매장 목록
- `POST /api/owner/stores`: 매장 생성
- `GET /api/owner/issuance/pending`: 대기 중인 적립 요청
- `POST /api/owner/issuance/{id}/approve`: 적립 승인

**Customer APIs (Wallet Session 필요)**
- `POST /api/wallet/register`: 지갑 등록
- `POST /api/wallet/access`: 지갑 접속
- `POST /api/issuance`: 적립 요청 생성
- `GET /api/issuance/{id}`: 적립 요청 상태 조회
- `GET /api/redemption/my-rewards`: 내 리워드 목록
- `POST /api/redemption/redeem`: 리워드 사용 세션 생성
- `POST /api/redemption/complete`: 리워드 사용 완료

---

## 추가 리뷰 포인트

### 보안 체크리스트
- [ ] 비밀번호 평문 저장 금지 (BCrypt 사용 확인)
- [ ] JWT 시크릿 키 환경변수 관리
- [ ] SQL Injection 방지 (JPA 사용)
- [ ] XSS 방지 (React 기본 이스케이핑)
- [ ] CORS 설정 확인 (프로덕션에서는 특정 도메인만 허용)
- [ ] Rate Limiting 필요 (지갑 조회, OTP 검증)

### 성능 최적화 포인트
- [ ] N+1 쿼리 문제 확인 (로그 조회 시 fetch join 필요)
- [ ] 페이징 미구현 (향후 추가)
- [ ] 폴링 간격 조정 (서버 부하 고려)
- [ ] 프론트엔드 번들 크기 (현재 732KB - 코드 스플리팅 고려)

### 향후 개선 사항
- [ ] WebSocket/SSE로 폴링 대체
- [ ] Refresh Token 추가
- [ ] 스탭 계정 분리 (현재는 오너 공유)
- [ ] OCR/AI 자동 스탬프 인식
- [ ] 실제 SMS OTP 연동
- [ ] 프로덕션 DB (MySQL) 마이그레이션
- [ ] Redis 캐싱
- [ ] 모니터링/로깅 (ELK Stack)

---

## 문제 해결 가이드

### 자주 발생하는 이슈

**1. CORS 에러**
- 원인: `CorsConfig.java`에 프론트엔드 포트 누락
- 해결: `allowedOriginPatterns`에 `http://localhost:*` 패턴 사용

**2. 클라이언트 빌드 실패**
- 원인: 테스트 파일 타입 에러
- 해결: `tsconfig.app.json`에서 테스트 파일 제외

**3. 스탬프 적립 후 리워드 미발급**
- 확인: `IssuanceService.java`의 `issueReward()` 로직
- stampCount >= stampGoal 조건 확인
- 중복 발급 방지 로직 확인

**4. 리워드 사용 시 OTP_VERIFICATION_REQUIRED 에러**
- 원인: step-up 인증 만료 (10분)
- 해결: OTP 재입력 후 다시 시도

---

## 참고 자료

- **프로젝트 가이드**: `CLAUDE.md` - 전체 요구사항 및 스펙
- **빌드 스크립트**: `build.sh/bat`, `run.sh/bat`
- **API 문서**: http://localhost:8080/swagger-ui/index.html
- **Git Commit History**: 기능별 커밋 메시지 참고

---

## 질문 및 지원

코드 리뷰 중 질문이나 이슈가 있다면:
1. Swagger UI로 API 직접 테스트
2. 통합 테스트 실행으로 기본 플로우 검증
3. Git 커밋 히스토리에서 해당 기능 구현 과정 확인
4. CLAUDE.md의 비즈니스 요구사항과 대조

Happy coding! 🚀
