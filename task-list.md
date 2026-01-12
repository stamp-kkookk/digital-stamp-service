# KKOOKK (꾸욱) — 8주 MVP 전체 Task List (FE + BE)
> 기준: **2개월(8주) 내 출시**, “가장 빨리 결과를 볼 수 있고 구조가 가벼운 선택(1안)”으로 고정  
> 변경 반영: **PWA 미적용(설치/manifest/service worker/오프라인 캐시 전부 제외)** → **모바일 반응형 웹**으로 진행

---

## 0) 고정 의사결정(1안)
- **레포**: 모노레포 `/server` + `/client`
- **FE**: React 18 + TypeScript + Vite + React Router + TanStack Query + **Axios(통일)** + **MUI(통일)** + RHF + Zod + **npm(통일)**
- **BE**: Java 17+ + Spring Boot + Gradle + Spring Data JPA(Hibernate)
- **DB**: 로컬은 H2로 빠르게 시작 → 배포 환경은 MySQL(또는 동일 계열)로 전환(Should)
- **실시간**: SSE/WebSocket 없음. 고객/단말 모두 **Polling 고정**
- **인증(Owner)**: 이메일/비번 + JWT Access Token만(Refresh 없음)
- **고객 세션**: `X-Wallet-Session` 헤더로 세션 토큰(UUID)
- **OTP**: MVP에서는 DEV 모드(로그/고정코드) 허용 → 실SMS 연동은 추후 백로그

---

## 1) Definition of Done (공통)
- 기능 단위로 **API/화면/에러 처리**까지 연결되어 데모 가능
- 각 Task는 PR 단위로 머지 가능(리뷰 포인트 명확)
- 최소 테스트 기준(F섹션) 충족

---

## 2) Sprint 구성
- Sprint 1: 기반 + Owner 온보딩 + 고객 지갑 등록/조회
- Sprint 2: **적립(issuance) 요청/승인/폴링**
- Sprint 3: **리워드 발급 + 리딤(OTP step-up + TTL + 2차 확인 모달)**
- Sprint 4: **종이 스탬프 이전 + 로그/마감 + 배포 정리**

> 난이도: S(0.5~1d) / M(2~3d) / L(4~6d)

---

# Sprint 1 (1~2주차) — 기반 + 온보딩/조회까지
## Sprint 목표
- FE/BE 골격 완성, 공통 에러 처리 통일
- Owner 로그인 → Store 생성 → StampCard 생성(Active 1개 정책)
- 고객: QR 랜딩 → OTP 등록/조회 → 지갑 홈 기본 조회
- **PWA 미적용 확정**

---

## [FULL-01] 모노레포 부트스트랩
- 구분: [FULL]
- 설명: `/server`, `/client` 초기 세팅 및 실행 스크립트 정리
- AC:
  - `server`: `./gradlew bootRun` 실행
  - `client`: `npm i && npm run dev` 실행
  - 루트 README에 로컬 실행 방법 명시
- 의존성: 없음
- 난이도: S

## [BE-02] Spring Boot 기본 의존성/환경 구성
- 구분: [BE]
- 설명: web/validation/data-jpa/security/lombok(+선택 springdoc), H2 설정
- AC:
  - `/api/ping` 200 OK
  - H2로 엔티티 생성 동작(ddl-auto=update)
- 의존성: FULL-01
- 난이도: S

## [FE-03] React 베이스(라우터/쿼리/MUI) 구성
- 구분: [FE]
- 설명: Router, QueryClient, MUI Theme, 기본 레이아웃(PC/모바일 반응형)
- AC:
  - 라우트 2개(예: `/`, `/owner/login`) 렌더
  - API mock 1회 호출 후 렌더 반영
- 의존성: FULL-01
- 난이도: S

## [FE-04] **PWA 미적용 확정 Task**
- 구분: [FE]
- 설명: 이번 MVP는 PWA가 아니라 “모바일 반응형 웹”으로만 진행(혼선 방지)
- AC:
  - `vite-plugin-pwa` 미사용
  - manifest/service worker 파일 없음
  - README에 “MVP는 PWA 미지원” 명시
- 의존성: FE-03
- 난이도: S

## [FULL-05] 공통 에러 포맷/핸들링 통일
- 구분: [FULL]
- 설명: BE GlobalExceptionHandler + FE Axios interceptor로 에러 UX 통일
- AC:
  - 400/401/404/409/410/429 케이스에서 `{code,message,details}` 포맷 반환
  - FE에서 토스트/다이얼로그로 사용자 메시지 표시
- 의존성: BE-02, FE-03
- 난이도: M

---

## Owner 인증/기본 도메인

## [BE-06] OwnerAccount 엔티티/리포
- 구분: [BE]
- 설명: owner 계정 기본 모델
- AC:
  - email unique
  - passwordHash 저장(BCrypt)
- 의존성: BE-02
- 난이도: S

## [BE-07] Owner Auth API (register/login) + JWT
- 구분: [BE]
- 설명: 이메일/비번 기반 인증 + JWT 발급
- AC:
  - register/login 성공 시 accessToken 반환
  - 보호 API는 Authorization: Bearer 토큰 필요
- 의존성: BE-06
- 난이도: M

## [FE-08] Owner 로그인/회원가입 화면
- 구분: [FE]
- 설명: RHF+Zod 폼, 성공 시 토큰 저장 후 라우팅
- AC:
  - 로그인 성공 → `/owner/stores` 이동
  - 실패 시 에러 메시지 노출
- 의존성: BE-07, FULL-05
- 난이도: M

---

## Store/StampCard (MVP 단순화: Store당 Active StampCard 1개)

## [BE-09] Store CRUD (Owner Scope)
- 구분: [BE]
- 설명: owner가 자신의 store만 CRUD
- AC:
  - ownerId 기준으로만 조회/수정 가능
  - list/create/update 동작
- 의존성: BE-07
- 난이도: M

## [BE-10] StampCard 생성/조회 (Store당 1개 정책)
- 구분: [BE]
- 설명: store별 ACTIVE 1개만 허용(서비스 레벨 enforce)
- AC:
  - 생성 시 기존 ACTIVE 있으면 409(또는 기존 것 반환 정책 택1)
  - 조회 API 제공
- 의존성: BE-09
- 난이도: M

## [BE-11] Public Store/ActiveStampCard 조회 API
- 구분: [BE]
- 설명: 고객 QR 랜딩용 public API
- AC:
  - `/api/public/stores/{storeId}`
  - `/api/public/stores/{storeId}/active-stampcard`
- 의존성: BE-09, BE-10
- 난이도: S

## [FE-12] 백오피스 Store 리스트/생성
- 구분: [FE]
- 설명: store 목록, 생성 폼, 선택 후 상세로 이동
- AC:
  - create 후 목록 즉시 반영(react-query invalidate)
- 의존성: FE-08, BE-09
- 난이도: M

## [FE-13] StampCard 설정 화면(필드 최소)
- 구분: [FE]
- 설명: title/themeColor/stampGoal/rewardName/rewardExpiresInDays 등
- AC:
  - 저장 후 재진입 시 값 유지
  - validation(필수값/범위) 동작
- 의존성: BE-10
- 난이도: M

## [FE-14] QR 출력 화면(프린트 방식)
- 구분: [FE]
- 설명: FE에서 QR 생성(라이브러리 사용) + 브라우저 print 안내
- AC:
  - storeId 포함 URL QR 생성
  - PC에서 프린트 가능한 레이아웃
- 의존성: FE-12, BE-11
- 난이도: S

---

## 고객 Wallet 등록/조회 (OTP 포함)

## [BE-15] CustomerWallet / CustomerSession 엔티티
- 구분: [BE]
- 설명: 고객 지갑과 세션 모델
- AC:
  - phone unique(최소 MVP)
  - sessionToken(UUID) 발급 및 만료 필드
- 의존성: BE-02
- 난이도: M

## [BE-16] OTP Challenge(발송/검증) API (DEV 모드)
- 구분: [BE]
- 설명: challenge 저장 + TTL(예: 3분), purpose 구분
- AC:
  - send → challengeId 발급
  - verify → 성공/실패/만료 처리
  - DEV에서는 otpCode를 로그로 출력(또는 고정코드)
- 의존성: BE-15
- 난이도: M

## [BE-17] Wallet register/access API
- 구분: [BE]
- 설명: 최초 등록(OTP 필수), 재방문 조회(전화+이름)
- AC:
  - register 성공 시 sessionToken(scope=FULL) 발급
  - access 성공 시 sessionToken(scope=VIEW) 발급
  - rate-limit(최소) 실패 시 429
- 의존성: BE-16, FULL-05
- 난이도: M

## [BE-18] Wallet me 조회 API
- 구분: [BE]
- 설명: 지갑 요약 반환(초기 stampCards/rewards는 비어도 됨)
- AC:
  - `X-Wallet-Session`으로 wallet 식별
  - 세션 없거나 만료 시 401
- 의존성: BE-17
- 난이도: S

## [FE-19] 고객 QR 랜딩(`/s/:storeId`)
- 구분: [FE]
- 설명: Store/ActiveStampCard 표시 + “지갑 열기(등록/접근)” CTA
- AC:
  - storeId 없거나 유효하지 않으면 404 UI
- 의존성: FE-03, BE-11
- 난이도: S

## [FE-20] 고객 등록/접근 화면(OTP 포함)
- 구분: [FE]
- 설명: register/access 플로우 분리, 성공 시 세션 저장
- AC:
  - register 성공 → `/wallet/home`
  - access 성공 → `/wallet/home`(조회 전용 안내 가능)
  - 에러 메시지/리트라이 UX
- 의존성: BE-17, FULL-05
- 난이도: M

## [FE-21] 지갑 홈(초기)
- 구분: [FE]
- 설명: `/api/customer/wallets/me` 렌더 + 세션 가드
- AC:
  - 세션 없으면 `/wallet/access`로 유도
  - 기본 레이아웃에서 모바일에서도 사용 가능
- 의존성: BE-18, FE-20
- 난이도: M

---

# Sprint 2 (3~4주차) — 적립(issuance) 요청/승인/폴링
## Sprint 목표
- IssuanceRequest 생성 → 고객 대기(Polling) → 단말 승인/거절 → 스탬프 반영
- WalletStampCard 자동 생성 및 StampEvent 원장 기록

---

## [BE-22] IssuanceRequest 엔티티/리포 + TTL 처리
- 구분: [BE]
- 설명: 적립 요청(1회성, TTL)
- AC:
  - expiresAt 저장
  - 조회 시 TTL 지나면 EXPIRED 처리(상태 전환 또는 응답 변환 택1)
- 의존성: BE-09, BE-15
- 난이도: M

## [BE-23] 고객 적립 요청 생성 API (+ 멱등 최소)
- 구분: [BE]
- 설명: clientRequestId 기반 중복 방지(최소 멱등)
- AC:
  - 동일 clientRequestId로 재호출 시 동일 requestId 반환(정책 고정)
  - TTL 내 1개만 유효하도록 정책(선택)
- 의존성: BE-22
- 난이도: M

## [BE-24] 고객 적립 요청 상태 조회 API
- 구분: [BE]
- 설명: 고객 폴링용 상태 조회
- AC:
  - PENDING/APPROVED/REJECTED/EXPIRED 정확히 응답
- 의존성: BE-22
- 난이도: S

## [BE-25] WalletStampCard 모델 + 자동 생성 규칙
- 구분: [BE]
- 설명: wallet+stampCard별 진행률 저장
- AC:
  - unique(walletId, stampCardId)
  - 최초 승인 시 없으면 생성 후 count=1
- 의존성: BE-15, BE-10
- 난이도: M

## [BE-26] StampEvent(원장) 기록 (ISSUED)
- 구분: [BE]
- 설명: 적립 승인 시 원장 기록
- AC:
  - type=ISSUED, delta=+1, ref=issuanceRequestId 저장
- 의존성: BE-25
- 난이도: M

## [BE-27] 매장 단말: 대기 리스트 조회 API
- 구분: [BE]
- 설명: storeId 기준 PENDING 목록 제공
- AC:
  - not expired 조건 반영
  - 최신순 정렬
- 의존성: BE-22
- 난이도: S

## [BE-28] 매장 단말: 승인/거절 API + 스탬프 반영
- 구분: [BE]
- 설명: 승인 시 WalletStampCard +1, StampEvent 기록, 요청 상태 전환
- AC:
  - 승인 1회만 가능(중복 승인 방지)
  - 거절 시 reason 저장(간단)
  - 처리 후 고객 조회에서 즉시 상태 반영
- 의존성: BE-25, BE-26, BE-27
- 난이도: L

---

## [FE-29] 고객 스탬프카드 상세 + “적립하기”
- 구분: [FE]
- 설명: 적립 요청 생성 후 대기 화면 이동
- AC:
  - create issuance 성공 → `/issuance/:id/wait`
  - 실패 시 재시도 UX
- 의존성: BE-23, FE-21
- 난이도: M

## [FE-30] 적립 승인 대기 화면(Polling)
- 구분: [FE]
- 설명: 2~3초 폴링 + TTL 카운트다운
- AC:
  - APPROVED 시 “적립 완료” 화면 전환
  - EXPIRED 시 “만료” 안내 + 재요청 버튼
- 의존성: BE-24, FE-29
- 난이도: M

## [FE-31] 매장 단말 화면(terminal) — 리스트/승인/거절
- 구분: [FE]
- 설명: `/owner/terminal?storeId=...` 화면. 폴링으로 목록 갱신
- AC:
  - 2초 폴링
  - 승인/거절 즉시 반영(리스트에서 제거)
  - 네트워크 실패 시 재시도 표시
- 의존성: BE-27, BE-28, FE-08
- 난이도: L

## [FULL-32] 적립 E2E 스모크(수동 시나리오 문서화)
- 구분: [FULL]
- 설명: QA 체크리스트 + 데모 플로우 확정
- AC:
  - “고객 요청→단말 승인→고객 화면 완료” 1회 이상 시연 성공
  - 체크리스트 10개 작성
- 의존성: FE-29~31, BE-28
- 난이도: S

---

# Sprint 3 (5~6주차) — 리워드 발급 + 리딤(OTP step-up + TTL + 2차 확인 모달)
## Sprint 목표
- 목표 도달 시 RewardInstance 발급
- step-up OTP 세션(10분) → RedeemSession(TTL 30~60초) → complete(중복 방지)
- 고객 확인 화면(2차 모달) 완성

---

## [BE-33] RewardInstance 모델 + 발급 로직
- 구분: [BE]
- 설명: stampCount가 goal 도달 시 1회 발급
- AC:
  - 동일 목표 도달 구간에서 중복 발급 방지(예: lastIssuedAt 또는 issuedCount 관리)
  - Reward expiresAt 계산(rewardExpiresInDays)
- 의존성: BE-28, BE-10
- 난이도: L

## [BE-34] Step-up OTP 상태를 CustomerSession에 반영
- 구분: [BE]
- 설명: OTP verify 성공 시 `otpVerifiedUntil=now+10m`
- AC:
  - 목적(purpose)=STEP_UP_REDEEM 일 때만 갱신
  - 만료되면 리딤 생성 거절(403 또는 401 정책 택1)
- 의존성: BE-16
- 난이도: M

## [BE-35] RedeemSession 생성 API
- 구분: [BE]
- 설명: reward 사용 시작 세션 생성(1회성, TTL)
- AC:
  - step-up 유효 필수
  - TTL 저장(30~60초)
  - clientRequestId 멱등 최소 적용
- 의존성: BE-33, BE-34
- 난이도: M

## [BE-36] Redeem complete API + 멱등/중복 방지
- 구분: [BE]
- 설명: 고객 화면에서 “사용 처리” 완료
- AC:
  - reward AVAILABLE → USED 1회만
  - 재호출 시 동일 결과 반환 또는 409(정책 고정)
  - RedeemEvent 기록
- 의존성: BE-35
- 난이도: L

## [BE-37] (Should) 매장 단말 리딤 진행중 목록 조회 API
- 구분: [BE]
- 설명: 단말에서 참고용으로 PENDING 세션 보여주기
- AC:
  - storeId로 PENDING/EXPIRED 구분 조회
- 의존성: BE-35
- 난이도: S

---

## [FE-38] 지갑 홈: 리워드 목록 표시
- 구분: [FE]
- 설명: AVAILABLE/USED/EXPIRED 상태 표시(최소 AVAILABLE 위주)
- AC:
  - AVAILABLE 리워드 → 상세 이동 가능
- 의존성: BE-33, FE-21
- 난이도: M

## [FE-39] 리딤 step-up OTP UI(필요 시)
- 구분: [FE]
- 설명: “사용하기” 클릭 시 step-up 필요하면 OTP 화면으로 유도
- AC:
  - step-up 완료 후 원래 리딤 플로우로 복귀
- 의존성: BE-34, FULL-05
- 난이도: M

## [FE-40] RedeemSession 생성 후 “매장 확인 화면”
- 구분: [FE]
- 설명: `/redeem/:sessionId/confirm` TTL 카운트다운/만료 처리
- AC:
  - TTL 내 완료 못하면 만료 안내 + 뒤로가기
  - Polling으로 session status 확인(필요 시)
- 의존성: BE-35
- 난이도: M

## [FE-41] 2차 확인 모달 + complete 호출
- 구분: [FE]
- 설명: MUI Dialog로 “되돌릴 수 없음” 확인
- AC:
  - 모달 확인 시에만 complete API 호출
  - 완료 시 “사용 완료” 화면 전환
  - 중복 클릭 방지(버튼 disable)
- 의존성: BE-36, FE-40
- 난이도: M

## [FE-42] (Should) 매장 단말에 리딤 진행중 표시
- 구분: [FE]
- 설명: terminal 화면에 PENDING redeem 세션 표시(참고용)
- AC:
  - 리스트 폴링 + 간단 표시(지갑/리워드/만료시간)
- 의존성: BE-37, FE-31
- 난이도: M

## [FULL-43] 리딤 E2E 스모크(수동 시나리오)
- 구분: [FULL]
- 설명: “step-up→세션 생성→모달→complete→중복 방지” 데모
- AC:
  - 시연 1회 이상 성공
  - 체크리스트(최소 8개) 작성
- 의존성: FE-38~41, BE-36
- 난이도: S

---

# Sprint 4 (7~8주차) — 종이 스탬프 이전 + 로그/마감 + 배포 정리
## Sprint 목표
- 사진 업로드 → 이전 요청 생성/상태 조회
- 백오피스 승인/반려 → 스탬프 반영 + MIGRATED 이벤트 기록
- 로그 조회 화면(간단)
- 최소 테스트 세트 + 배포 형태 정리

---

## [BE-44] 파일 업로드(로컬 스토리지) + 정적 서빙
- 구분: [BE]
- 설명: `/uploads` 저장 + DB에 path 저장(가장 가벼운 1안)
- AC:
  - multipart 업로드 성공
  - owner 백오피스에서 이미지 조회 가능(인증 고려)
- 의존성: BE-02
- 난이도: M

## [BE-45] StampMigrationRequest 생성/조회(고객)
- 구분: [BE]
- 설명: 고객이 사진 등록 요청 제출, 내 요청 목록 조회
- 정책(고정): wallet당 1회 + 처리중 재신청 불가
- AC:
  - 정책 위반 시 409
  - status SUBMITTED/APPROVED/REJECTED 표시
- 의존성: BE-44, BE-15
- 난이도: M

## [BE-46] 백오피스: 이전 요청 승인/반려 + 스탬프 반영 + StampEvent(MIGRATED)
- 구분: [BE]
- 설명: 운영자가 인정 스탬프 수 입력해 반영
- AC:
  - 승인 시 WalletStampCard += approvedStampCount
  - StampEvent(type=MIGRATED, delta=+n) 기록
  - 반려 시 rejectReason 저장
  - 처리 완료 후 고객 상태 조회에 반영
- 의존성: BE-45, BE-25
- 난이도: L

## [FE-47] 고객: 이전 신청 화면 + 상태 조회
- 구분: [FE]
- 설명: 이미지 업로드 폼 + 내 요청 상태 리스트
- AC:
  - 제출 성공 후 SUBMITTED 표시
  - 처리 결과(승인/반려) 표시
- 의존성: BE-45
- 난이도: M

## [FE-48] 백오피스: 이전 요청 목록/상세 + 승인/반려
- 구분: [FE]
- 설명: 이미지 뷰어 + 승인(숫자 입력) + 반려(사유 입력)
- AC:
  - 승인 후 고객 stampCount 증가 확인 가능(지갑 조회로 검증)
- 의존성: BE-46, FE-08
- 난이도: L

---

## 로그/마감/배포

## [BE-49] 로그 조회 API(StampEvent/RedeemEvent)
- 구분: [BE]
- 설명: 기간/지갑/매장 필터로 간단 조회
- AC:
  - from/to/storeId/walletId 필터 동작
  - 기본 정렬(createdAt desc)
- 의존성: BE-26, BE-36, BE-46
- 난이도: M

## [FE-50] 로그 화면(검색 + 테이블)
- 구분: [FE]
- 설명: 간단 검색폼 + 결과 테이블
- AC:
  - 조건 변경 시 재조회
  - 빈 결과/에러 상태 처리
- 의존성: BE-49
- 난이도: M

## [FULL-51] 배포 형태 결정 & 빌드/런 스크립트 정리
- 구분: [FULL]
- 1안: FE build 산출물을 서버가 서빙(단일 도메인으로 CORS 단순화)
- AC:
  - `./gradlew bootJar` 산출
  - 배포/실행 방법 README에 정리
- 의존성: FULL-01
- 난이도: M

## [FULL-52] 회귀/스모크 테스트 최소 세트 작성 및 통과
- 구분: [FULL]
- 설명: 아래 “F. 최소 테스트 세트”를 실제로 만들고 CI 없이라도 로컬에서 통과
- AC:
  - BE 스모크 3개(적립/리딤/마이그레이션) 통과
  - FE 스모크 3개(랜딩/issuance wait/redeem confirm) 통과
- 의존성: 전체 기능
- 난이도: M

---

# F. 최소 테스트 세트(권장 구현 기준)
## BE (JUnit5)
- `@SpringBootTest` + H2 기반으로 **플로우 3개**:
1) 적립: issuance 생성 → owner 승인 → stampCount +1 & StampEvent 기록
2) 리딤: step-up 유효 → redeemSession 생성 → complete → reward USED & RedeemEvent 기록, 중복 방지
3) 마이그레이션: 요청 SUBMITTED → owner approve(n) → stampCount +n & MIGRATED 이벤트 기록

## FE (Vitest + RTL)
- 화면 렌더 스모크 3개:
1) `/s/:storeId` 렌더 + API mock
2) `/issuance/:id/wait` 폴링 UI(타이머 mock)
3) `/redeem/:id/confirm` 모달 확인 → complete 호출 mock

> E2E(Playwright)는 이번 MVP에서는 “추후”로 두되, 시간 남으면 1개 플로우만 추가.

---

# G. 추후 고도화 백로그(이번 MVP 범위 밖)
- PWA(설치/오프라인/푸시)
- Redis 레이트리밋/TTL/멱등성 키
- Refresh Token/HttpOnly Cookie
- OCR/AI 판독 및 AI 디자인
- 직원 계정/권한 분리
- 통계 대시보드/마케팅 자동화
- 모니터링/CI-CD/접근성/성능 고도화

---
