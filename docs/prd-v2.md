# PRD: 꾸욱(KKOOKK) — POS 연동 없는 디지털 스탬프/리워드 SaaS

> Last Updated: 2026-02-25 | 코드베이스 및 feature-specs 기준 전면 개정

---

## 1. 제품 요약

- 꾸욱(KKOOKK)은 카페·소상공인을 위한 **웹 기반 디지털 스탬프/쿠폰 플랫폼**이다.
- 고객은 **QR로 매장에 진입**한 뒤, **OAuth(Google/Kakao/Naver)**로 인증하여 적립/리딤을 요청한다.
- 적립/리딤 확정은 **매장(사장님 백오피스)에서의 승인**으로 완료된다.
- 사장님은 백오피스에서 **StampCard 디자인/규칙 설정**, **적립 승인**, **로그/통계** 기능을 운영한다.
- POS 연동 없이 운영 가능한 "현장 승인형" 스탬프 리워드 SaaS를 목표로 한다.
- 도입 초기 전환 장벽을 낮추기 위해 기존 종이 스탬프를 사진으로 등록(수동 반영)하는 마이그레이션 기능을 제공한다.
- 매장 등록은 **관리자(Admin) 승인제**로 운영하여 품질을 관리한다.

---

## 2. 목표 / 성공지표 (Metrics)

### 2.1 핵심 KPI

- 적립 요청 → 승인 완료율
- 리딤 요청 → 사용 완료율
- 재방문율 (D7 / D30)
- 리워드 사용률 (리딤율)
- 부정 시도 차단율 (만료/중복/TTL/멱등성으로 차단된 비율)
- CS 이슈 해결 리드타임 (적립/리딤 누락, 이전 등록 처리)

### 2.2 퍼널 KPI

1. 매장 진입 (QR Scan)
2. (최초 1회) OAuth 인증 + 프로필 입력 (이름, 닉네임, 전화번호)
3. 지갑 생성 / 접속
4. 적립 요청 생성
5. 매장 승인
6. 적립 완료
7. 리워드 달성 → 리딤(사용하기)
8. 확인 모달 → 사장님 확인 (고객 폰에서 누름)
9. 사용 완료
10. (선택) 기존 종이 스탬프 사진 등록 → 수동 반영 완료

---

## 3. 사용자 / 테넌트 구조

### 3.1 테넌트 구조

- **OwnerAccount(사장님 계정)** → **Store(매장)** N개 → **StampCard** N개
- 고객은 **CustomerWallet(지갑)** 단위로 여러 Store/StampCard를 보유
- **OAuthAccount**가 양방향 링크로 Owner와 Customer를 연결 (동일 소셜 계정으로 양쪽 역할 가능)

### 3.2 사용자 유형

| 유형 | 인증 | 역할 | 주요 동작 |
|------|------|------|----------|
| **사장님(Owner)** | OAuth (Google/Kakao/Naver) | `ROLE_OWNER` | 매장 관리, StampCard 운영, 적립 승인, 마이그레이션 승인, 통계 조회 |
| **고객(Customer)** | OAuth (Google/Kakao/Naver) | `ROLE_CUSTOMER` | 적립 요청, 리딤 요청, 마이그레이션 신청, 지갑 조회 |
| **관리자(Admin)** | OAuth (admin 계정) | `ROLE_ADMIN` | 매장 승인/정지, 감사 로그 조회 |

> 매장 운영은 "사장님 계정 1개"로 통합 (직원도 동일 계정 사용)

---

## 4. 플랫폼 구성

| 플랫폼 | 환경 | 용도 |
|--------|------|------|
| **고객 Web** | 모바일 퍼스트 | QR 진입 → 지갑 → 적립/리딤 |
| **사장님 백오피스 Web** | 데스크톱 퍼스트 | 매장 관리, StampCard 운영, 적립 승인, 통계 |
| **관리자 Web** | 데스크톱 | 매장 승인/정지, 감사 로그 |

- 적립 승인은 사장님 백오피스의 승인 화면에서 처리 (별도 터미널 없음)
- 리딤은 고객 폰 화면에서 사장님이 직접 확인 버튼을 누르는 방식

---

## 5. 핵심 유저 시나리오

### 5.1 사장님 온보딩 (Backoffice)

1. OAuth 회원가입 (Google/Kakao/Naver) → 이름, 닉네임, 전화번호 입력
2. 매장 등록 (카카오 장소 검색으로 placeRef 연동, N개 가능)
3. **Admin 승인 대기** (DRAFT → Admin이 LIVE로 전환)
4. **StampCard 생성** (디자인 타입 선택 → 규칙 설정 → DRAFT → ACTIVE 활성화)
5. 매장 고정 QR 생성 (storeId 기반)
6. 백오피스 승인 화면에서 적립 승인 운영 시작

### 5.2 고객 플로우 (Customer)

1. QR → 매장 페이지로 즉시 접근
2. (최초 1회) OAuth 로그인 → 이름 + 닉네임 + 전화번호 입력 → 지갑 생성
3. 이후 재방문: OAuth 로그인 → 지갑 접근 (로그인 시 해당 매장의 Active StampCard 자동 등록)
4. 지갑 진입 시 현재 매장의 Active StampCard가 기본 노출, 보유한 다른 StampCard는 목록으로 탐색 가능
5. 적립하기 → 승인 대기 (폴링) → 매장 승인 → 적립 완료
6. 리워드 달성 시 자동 발급 → 사용하기 → 확인 모달 → 사장님 확인 → 사용 완료
7. (선택) 기존 종이 스탬프 사진 등록 → 사장님 확인 후 스탬프 반영
8. 스탬프 적립내역 / 리딤 사용내역 / 리워드 보관함 조회

---

# 6. 기능 요구사항 (Functional Requirements)

## 6.1 고객 Web — "스탬프 지갑"

### 6.1.1 진입 / 인증

#### QR 진입

- QR 링크는 `storeId` 포함 (`/stores/:storeId/customer`)
- 진입 시 해당 매장의 공개 정보(매장명, 아이콘, Active StampCard) 표시
- 비로그인 상태에서도 매장 정보 조회 가능 (Public API)

#### OAuth 인증

- **지원 Provider**: Google, Kakao, Naver
- **인증 흐름**:
  1. Frontend → OAuth Provider 인증 (Consent Screen)
  2. Provider → Frontend 콜백 (authorization code)
  3. Frontend → `POST /api/public/oauth/login` (provider, code, redirectUri, role=CUSTOMER)
  4. Backend → Provider API로 사용자 정보 조회
  5. 기존 사용자: JWT + Refresh Token 발급
  6. 신규 사용자: Temp Token 발급 (10분 TTL) → 추가 정보 입력 화면으로 이동

#### 최초 1회 가입 완료

- OAuth 인증 후 Temp Token을 가지고 추가 정보 입력:
  - 이름, 닉네임(중복 체크), 전화번호(중복 체크)
- `POST /api/public/oauth/complete-customer-signup` → CustomerWallet 생성 + JWT 발급
- 로그인 시 현재 매장의 Active StampCard가 있으면 WalletStampCard 자동 생성

#### 토큰 관리

| 토큰 | TTL | 용도 |
|------|-----|------|
| Customer JWT | 1시간 | `/api/customer/**` API 접근 |
| Refresh Token | 7일 | JWT 갱신 (`POST /api/auth/refresh`) |
| Temp Token | 10분 | 가입 완료 전 임시 토큰 |

---

### 6.1.2 지갑 홈

- **StampCard 목록**: 보유 중인 스탬프카드를 목록으로 표시
  - 카드에 표시되는 정보: 매장명, 진행률(현재 스탬프/목표), 리워드명, 상태(ACTIVE/COMPLETED)
  - 정렬 옵션: 최근 적립순(LAST_STAMPED) / 생성순(CREATED) / 진행률순(PROGRESS)
- **적립하기**: 현재 매장의 Active StampCard에서 적립 요청 생성
- **리워드 보관함**: 사용 가능한 리워드 목록 (AVAILABLE/REDEEMED/EXPIRED 필터)
- **히스토리**: 매장별 스탬프 적립 이력 / 리딤 사용 이력 (페이지네이션, 무한 스크롤)
- **마이그레이션**: 기존 종이 스탬프 이전 요청 생성 / 목록 조회

---

### 6.1.3 스탬프 적립 (사장님 승인 기반) — Polling 고정

#### 고객 화면 플로우

1. "적립하기" 클릭
2. `IssuanceRequest` 생성 (TTL: 120초, idempotencyKey 기반 중복 방지)
   - 동일 WalletStampCard에 PENDING 요청이 이미 있으면 해당 요청 반환 (멱등성)
3. "승인 대기 중" 화면 (상태 자동 갱신)
4. 매장 승인 시 자동 완료

#### 승인 대기 화면 UX

- "적립 승인 대기 중" + 남은 시간 (카운트다운)
- 상태 자동 갱신: **Polling 고정** (2~3초 간격으로 `IssuanceRequest.status` 조회)
- TTL 만료 시 재요청 유도
- 하단에 "요청번호"는 CS 대응용으로만 작게 노출
- 고객이 직접 **취소** 가능 (PENDING → CANCELLED)

#### 사장님 백오피스 플로우

- 승인 대기 목록에서 해당 요청 **승인/거절**
- 승인 시: stampCount +1, StampEvent(ISSUED) 원장 기록
- 목표 도달 시: WalletReward 자동 발급 + WalletStampCard → COMPLETED → 새 ACTIVE 카드 자동 생성 (카드 사이클링)

#### IssuanceRequest 상태 머신

```
PENDING → APPROVED   (사장님 승인)
PENDING → REJECTED   (사장님 거절)
PENDING → EXPIRED    (120초 TTL 만료, lazy expiration)
PENDING → CANCELLED  (고객 직접 취소)
```

#### 부정 방지

- TTL 120초, 1회성, idempotencyKey 기반 멱등성
- 동일 WalletStampCard에 PENDING 요청 중복 불가
- Store가 LIVE 상태여야 요청 가능
- Pessimistic lock으로 동시성 제어

---

### 6.1.4 리워드 사용(리딤) — 확인 모달 + 단일 API

#### 목표

- 고객이 리워드에서 [사용하기]로 즉시 사용을 요청한다.
- **사장님이 고객 폰 화면에서 확인 동작을 수행해야만 확정**된다.
- 고객 혼자 실수로 누르거나 악용하는 것을 막는 확인 모달을 제공한다.

#### 전체 플로우

1. 고객이 리워드 목록에서 **[사용하기]** 클릭
2. "매장 확인 화면"으로 전환
3. 사장님이 **"매장 확인(사장님 전용)"** 버튼 클릭
4. **2차 확인 모달**: "되돌릴 수 없습니다. 매장에서 확인 후 진행해 주세요." → [취소] / [확인]
5. 확인 시 `POST /api/customer/redeems` 호출 → WalletReward: AVAILABLE → REDEEMED + RedeemEvent 원장 기록
6. 사용 완료 화면 표시

#### WalletReward 상태 머신

```
AVAILABLE → REDEEMED  (사용 완료)
AVAILABLE → EXPIRED   (유효기간 만료)
```

#### 분쟁/오류 대응

- 사용 완료 기록은 시간/매장/StampCard/리워드/walletRewardId로 조회 가능
- 중복 사용 방지 (멱등성): 동일 리워드는 1회만 REDEEMED
- 매장이 LIVE 상태여야 리딤 가능
- 리워드 유효기간 만료 시 410 응답

---

### 6.1.5 기존 종이 스탬프 사진 등록 — (수동 반영)

#### 목적

- 서비스 도입 이전에 고객이 종이 쿠폰에 모아둔 스탬프를 **전환 장벽 없이 디지털로 이전**한다.
- 초기에는 자동 인식(OCR) 없이 **사장님이 사진을 보고 수동으로 스탬프 수를 반영**한다.

#### 고객 플로우

1. 마이그레이션 화면 → **[+]** 버튼으로 생성 화면 진입
2. 매장 선택 (해당 매장의 Active StampCard로 발급됨)
3. 사진 업로드 (Base64 인코딩, 최대 5MB)
4. 주장 스탬프 수 입력
5. 안내 문구: "사진 확인 후 반영까지 시간이 걸릴 수 있어요 (예: 24~48시간)."
6. 제출 완료 → 마이그레이션 요청 리스트에서 처리 진행 상태 확인

#### 사장님 플로우 (백오피스)

- "이전 요청 목록"에서 SUBMITTED 상태의 요청 조회
- 목록에서 사진 확인 → **"인정 스탬프 수 입력"** → 반영(승인) / 반려(사유)
- 반영 시:
  - `WalletStampCard.stampCount`를 **추가 증가** (사장님이 인정한 수만큼)
  - `StampEvent(type=MIGRATED)` 기록 (원장으로 남김)
  - 목표 도달 시 WalletReward 자동 발급 (적립과 동일 로직)
- 반려 시: 반려 사유 저장 + 고객에게 상태 표시

#### StampMigrationRequest 상태 머신

```
SUBMITTED → APPROVED   (사장님 승인 + 스탬프 반영)
SUBMITTED → REJECTED   (사장님 반려)
SUBMITTED → CANCELED   (고객 취소)
```

#### 정책 (악용 방지)

- 동일 고객+매장 조합에 SUBMITTED 상태의 요청이 있으면 신규 요청 불가
- BLOCKED 지갑은 마이그레이션 요청 불가
- 이미지 크기 제한: 5MB (413 Payload Too Large)

---

## 6.2 사장님 백오피스 Web

### 6.2.1 매장 관리

#### 매장 목록 화면

- 사장님이 등록한 **N개의 매장(Store)** 을 한 화면에서 조회 (DELETED 제외)
- 각 매장에 표시할 정보:
  - 매장명 (name)
  - 주소 (address)
  - 매장 상태 (DRAFT / LIVE / SUSPENDED)
  - Active StampCard 유무
  - QR 포스터 다운로드
  - 관리 버튼 (매장 상세 진입)
- **[매장 추가]** 버튼으로 매장 등록

#### 매장 등록 (DRAFT → Admin 승인 → LIVE)

- 매장 생성 시 항상 **DRAFT 상태**로 생성
- 카카오 장소 검색 API로 placeRef 연동 (`GET /api/owner/places/search`)
- placeRef는 고유값 (중복 등록 불가)
- Admin이 심사 후 DRAFT → LIVE로 전환해야 정상 운영 가능

#### 매장 수정 제약

| 매장 상태 | 수정 가능 필드 |
|-----------|--------------|
| DRAFT | 모든 필드 수정 가능 |
| LIVE | description, iconImageBase64만 수정 가능 (name, address, phone, placeRef 읽기 전용) |
| SUSPENDED | 수정 불가 |

#### Store 상태 머신

```
DRAFT ──(Admin 승인)──> LIVE
LIVE ──(Admin 정지)──> SUSPENDED
SUSPENDED ──(Admin 해제)──> LIVE
LIVE/SUSPENDED/DRAFT ──(Owner 삭제)──> DELETED (소프트 삭제, 최종)
```

#### 매장 감사 로그 (StoreAuditLog)

- 모든 상태 변경을 기록: CREATED, STATUS_CHANGED, UPDATED, DELETED
- 각 로그에 수행자(performerType: OWNER/ADMIN/SYSTEM), 수행자 ID, 변경 전/후 상태 기록

---

### 6.2.2 StampCard 관리

#### 매장 관리(상세) 화면

- 매장 목록에서 **[관리]** 버튼을 누르면 해당 매장의 관리 화면으로 이동
- **메인 영역**: Active StampCard 1개를 메인에 노출
  - 카드명, 적립 규칙 요약(N회→리워드), 리워드 유효기간, 상태(ACTIVE)
- **보관함/초안 영역**: StampCard를 상태별로 구분
  - **DRAFT (초안)**: 편집 가능, 미노출
  - **ARCHIVED (보관)**: 통계용 보존, ACTIVE로 재활성화 가능
- Active가 없는 경우:
  - 안내 문구: "현재 운영 중인 스탬프 카드가 없습니다."
  - CTA: [초안에서 활성화] 또는 [새 StampCard 만들기]

#### StampCard CRUD

- **생성**: 항상 DRAFT 상태로 생성
- **수정**: WalletStampCard가 발급된 적 있으면 수정 불가 (편집 잠금)
- **삭제**: DRAFT 상태의 카드만 삭제 가능
- **매장당 ACTIVE 1개 제한**: ACTIVE 활성화 시 기존 ACTIVE가 있으면 충돌 (409)

#### StampCard 상태 머신

```
DRAFT ──(활성화)──> ACTIVE
DRAFT ──(보관)──> ARCHIVED
ACTIVE ──(보관)──> ARCHIVED
ARCHIVED ──(재활성화)──> ACTIVE
```

> ACTIVE → DRAFT 전환 불가. ARCHIVED는 ACTIVE로만 복귀 가능.

---

### 6.2.3 StampCard 디자인 (템플릿)

StampCard 디자인은 템플릿 기반으로 생성하며, 아래 **4가지 디자인 타입**을 제공한다:

| 타입 | 설명 | 특징 |
|------|------|------|
| **COLOR (기본형)** | 5가지 색상 중 1개를 선택 | 가장 빠른 "원클릭 생성" 경험 |
| **IMAGE (이미지형)** | 이미지를 업로드하여 배경 구성 | 권장 비율/해상도 안내, 미리보기 |
| **PUZZLE (퍼즐형)** | 적립 시 퍼즐 조각이 완성되는 UX | 게임화 요소 |
| **CUSTOM (커스텀)** | 자유 디자인 JSON | 확장용 |

- 디자인 타입은 StampCard 생성 시 선택하며, `designJson` 필드에 타입별 설정 저장

---

### 6.2.4 리워드 규칙/정책

- **N회 적립 → 리워드**: `goalStampCount` 도달 시 `WalletReward` 자동 발급
- **유효기간**: `expireDays` 설정 시 발급일로부터 N일 후 만료 (null이면 무제한)
- **리워드 자동 발급**: 적립 승인 또는 마이그레이션 승인으로 목표 도달 시 자동 처리
- **카드 사이클링**: 목표 도달 시 WalletStampCard → COMPLETED, 새 ACTIVE 카드 자동 생성

---

### 6.2.5 적립 승인

- 사장님 백오피스에 **적립 승인 화면** 제공
- 대기 중인 IssuanceRequest 목록 표시 (PENDING 상태, 매장별)
- 각 요청에 대해 **승인/거절** 처리
- 승인 시: stampCount +1, StampEvent 기록, 목표 도달 체크
- 거절 시: 상태를 REJECTED로 변경

---

### 6.2.6 통계

- 매장별 통계를 기간 필터와 함께 조회 (`GET /api/owner/stores/{storeId}/statistics`)
- 기본 기간: 최근 30일 (startDate~endDate 지정 가능)

#### 제공 지표

| 지표 | 설명 | 데이터 소스 |
|------|------|-----------|
| `totalStamps` | 누적 적립 수 | StampEvent (양수 delta 합계) |
| `totalRewardsIssued` | 리워드 발급 수 | WalletReward (issuedAt 기준) |
| `totalRewardsRedeemed` | 리워드 사용 수 | RedeemEvent (result=SUCCESS) |
| `activeUsers` | 활성 이용자 수 | StampEvent (DISTINCT walletId) |
| `dailyTrend` | 일별 적립 추이 | [{date, count}] sparse array |

- dailyTrend은 **sparse array**: 활동이 있는 날짜만 포함, 프론트엔드에서 빈 날짜를 0으로 채움

---

### 6.2.7 이벤트 로그 / 감사

- **스탬프 이벤트 이력**: 매장별 StampEvent 조회 (페이지네이션)
  - 타입: ISSUED(적립), MIGRATED(이전 반영), MANUAL_ADJUST(수동 조정)
- **리딤 이벤트 이력**: 매장별 RedeemEvent 조회 (페이지네이션)
- **마이그레이션 요청 관리**: SUBMITTED 상태 요청의 승인/반려

---

### 6.2.8 종이 스탬프 "이전 요청" 처리

- 이전 요청 목록/상세 (이미지 뷰어)
- 승인: 인정 스탬프 수 입력 → stampCount 반영 + StampEvent(MIGRATED) 기록
- 반려: 사유 입력 → 고객에게 표시
- 처리 로그 남김 (감사/분쟁 대응)

---

## 6.3 관리자(Admin) Web

### 6.3.1 매장 심사/관리

- 전체 매장 목록 조회 (status 필터 가능: DRAFT, LIVE, SUSPENDED, DELETED)
- 매장 상세 조회 (Owner 정보 포함)
- **매장 상태 변경**:
  - DRAFT → LIVE (승인)
  - LIVE → SUSPENDED (정지)
  - SUSPENDED → LIVE (해제)
- 상태 변경 시 StoreAuditLog 자동 기록 (performerType=ADMIN)

### 6.3.2 감사 로그

- 매장별 Audit Log 조회 (상태 변경 이력, 수행자, 시각)

---

## 7. 데이터/이벤트 모델

### 7.1 핵심 엔티티

| 엔티티 | 설명 | 주요 필드 |
|--------|------|----------|
| **OAuthAccount** | OAuth Provider 연결 (dual-link) | provider, providerId, email, customerWalletId(nullable), ownerAccountId(nullable) |
| **OwnerAccount** | 사장님 계정 | name, nickname, phone, admin(boolean) |
| **Store** | 매장 | name, address, phone, placeRef(unique), status, iconImageBase64, category, description |
| **StoreAuditLog** | 매장 감사 로그 | storeId, action, previousStatus, newStatus, performerType, performerId |
| **StampCard** | 스탬프카드 디자인/규칙 | title, goalStampCount, rewardName, rewardQuantity, expireDays, designType, designJson, status |
| **CustomerWallet** | 고객 지갑 | name, nickname, phone, status(ACTIVE/BLOCKED) |
| **WalletStampCard** | 고객별 스탬프 진행 | walletId, storeId, stampCardId, stampCount, goalStampCount, status(ACTIVE/COMPLETED), version |
| **WalletReward** | 자동 발급된 리워드 | walletId, storeId, stampCardId, walletStampCardId, status(AVAILABLE/REDEEMED/EXPIRED), issuedAt, expiresAt, redeemedAt |
| **IssuanceRequest** | 적립 요청 | walletId, walletStampCardId, storeId, stampCardId, idempotencyKey, status, expiresAt |
| **StampEvent** | 스탬프 이벤트 원장 | walletStampCardId, type(ISSUED/MIGRATED/MANUAL_ADJUST), delta, currentCount, issuanceRequestId |
| **RedeemEvent** | 리딤 이벤트 원장 | walletRewardId, walletId, storeId, result(SUCCESS/FAILED/EXPIRED) |
| **StampMigrationRequest** | 종이 스탬프 이전 | walletId, storeId, walletStampCardId, imageBase64, claimedStampCount, approvedStampCount, status, rejectReason |

### 7.2 주요 상태 Enum

| Enum | 값 | 전이 |
|------|---|------|
| StoreStatus | DRAFT, LIVE, SUSPENDED, DELETED | DRAFT→LIVE(Admin), LIVE↔SUSPENDED(Admin), →DELETED(Owner, 소프트삭제) |
| StampCardStatus | DRAFT, ACTIVE, ARCHIVED | DRAFT→ACTIVE/ARCHIVED, ACTIVE→ARCHIVED, ARCHIVED→ACTIVE |
| IssuanceRequestStatus | PENDING, APPROVED, REJECTED, EXPIRED, CANCELLED | PENDING → {APPROVED, REJECTED, EXPIRED, CANCELLED} |
| StampMigrationStatus | SUBMITTED, APPROVED, REJECTED, CANCELED | SUBMITTED → {APPROVED, REJECTED, CANCELED} |
| WalletRewardStatus | AVAILABLE, REDEEMED, EXPIRED | AVAILABLE → REDEEMED(사용) / EXPIRED(만료) |
| WalletStampCardStatus | ACTIVE, COMPLETED | ACTIVE → COMPLETED(목표 도달) |
| CustomerWalletStatus | ACTIVE, BLOCKED | BLOCKED 시 모든 기능 차단 (403) |

### 7.3 원칙

- 진행률은 캐시/집계 가능하나 원장(StampEvent)으로 복원 가능해야 함
- 분쟁/정산은 이벤트 원장(StampEvent, RedeemEvent)으로 복구 가능
- 기존 이전 반영도 StampEvent에 `MIGRATED`로 남겨야 함
- 모든 엔티티는 `BaseTimeEntity` 상속 (id, createdAt, updatedAt 자동 관리)

---

## 8. 보안/부정 방지

### 8.1 인증/세션 보안

| 항목 | 구현 |
|------|------|
| 인증 방식 | OAuth 2.0 (Google, Kakao, Naver) |
| 세션 토큰 | JWT (1시간) + Refresh Token (7일) |
| 권한 분리 | ROLE_CUSTOMER, ROLE_OWNER, ROLE_ADMIN |
| URL 패턴 | `/api/public/**` 개방, 나머지 역할별 잠금 |
| 크로스 접근 | Owner API에서 타인 매장 접근 시 404 (403이 아닌 404로 정보 노출 방지) |

### 8.2 적립 부정 방지

- IssuanceRequest TTL: 120초 (Lazy Expiration)
- idempotencyKey 기반 멱등성 (Unique Constraint)
- 동일 WalletStampCard에 PENDING 요청 중복 불가
- Pessimistic Lock으로 동시성 제어 (IssuanceRequest + WalletStampCard)
- Store가 LIVE(Operational) 상태여야 적립 가능

### 8.3 리딤 부정 방지

- 2차 확인 모달 (비가역적 행위 고지)
- WalletReward 상태 검증 (AVAILABLE만 사용 가능)
- 유효기간 만료 체크 (410 GONE)
- 매장 LIVE 상태 체크

### 8.4 마이그레이션 부정 방지

- 동일 고객+매장에 SUBMITTED 요청 중복 불가
- BLOCKED 지갑 차단
- 이미지 크기 제한 (5MB)
- 사장님의 수동 심사 (자동 승인 없음)

### 8.5 감사 로그

- 적립/리딤/마이그레이션 반영은 최소 기록:
  - walletId, storeId, stampCardId, time, result
- 매장 상태 변경: StoreAuditLog (수행자, 변경 전/후 상태)

---

## 9. 비기능 요구사항 (NFR)

| 항목 | 요구사항 |
|------|---------|
| 응답 시간 | 승인 반영 후 폴링 2~3초 내 감지 |
| 가용성 | 99.5% (MVP) |
| 관측성 | 에러 로깅, ErrorCode 기반 표준 에러 응답 |
| 보안 | JWT 서명 검증, Refresh Token 만료, 역할 기반 접근 제어 |
| 캐싱 | Store Summary 캐시 (Caffeine, 10분 TTL) |
| 페이지네이션 | 무한 스크롤 (1~100 items/page, 기본 20) |
| 이미지 | Base64 인코딩, 최대 5MB (MEDIUMTEXT) |

---

## 10. 엣지 케이스/정책

| 케이스 | 정책 |
|--------|------|
| StampCard 없는 매장 | 안내 문구 + [새 StampCard 만들기] CTA |
| 매장당 Active 카드 중복 | 409 Conflict (1개 제한) |
| 승인 대기 중 이탈 | TTL(120s) 내 폴링 재개로 복원, 만료 시 재요청 |
| 리딤 오작동 | 2차 확인 모달 필수 |
| BLOCKED 지갑 | 모든 API에서 403 응답 |
| 마이그레이션 중복 신청 | 동일 매장에 SUBMITTED 상태 요청 있으면 차단 |
| 카드 수정 후 발급된 카드 | WalletStampCard 존재 시 StampCard 수정 불가 |
| 목표 도달 후 카드 사이클링 | COMPLETED → 새 ACTIVE WalletStampCard 자동 생성 |
| 매장 DRAFT 상태에서 고객 접근 | LIVE 매장만 Public API에 노출 |
| placeRef 중복 등록 | 409 Conflict |

---

## 11. MVP 범위

### MVP-1 (구현 완료)

- **인증**: OAuth 로그인/가입 (Google, Kakao, Naver), JWT + Refresh Token
- **매장**: CRUD, 카카오 장소 검색 연동, Admin 승인제 (DRAFT→LIVE), 소프트 삭제
- **StampCard**: CRUD, 4종 디자인 타입, 상태 관리 (DRAFT/ACTIVE/ARCHIVED), 매장당 1개 ACTIVE 제한
- **적립**: 요청 생성 + 승인 대기(Polling) + 매장 승인/거절, TTL/멱등성/동시성 제어
- **리딤**: 확인 모달 + 즉시 사용, RedeemEvent 원장 기록
- **마이그레이션**: 사진 등록 + 사장님 수동 승인/반려
- **지갑**: StampCard 목록 (정렬), 히스토리 (페이지네이션), 리워드 보관함
- **통계**: 5개 핵심 지표 + 일별 추이 (기간 필터)
- **보안**: JWT 인증, 역할 분리, 크로스 접근 차단, 감사 로그
- **Admin**: 매장 승인/정지, Audit Log 조회
- **QR**: 매장별 QR 코드 생성
- **랜딩 페이지**: Hero, 문제/해결 섹션, FAQ, StampCard 캐러셀

### MVP-2 (향후 확장)

- **알림 시스템**: SMS/이메일/푸시 알림 (적립 승인, 리워드 발급 등)
- **고급 통계**: 주간 추이, 시간대별 방문 분석, 트렌드 예측
- **AI 디자인**: StampCard 시안 AI 생성/편집
- **자동 OCR**: 종이 스탬프 사진 자동 판독
- **파일 스토리지**: Base64 → S3/클라우드 스토리지 전환
- **Rate Limiting**: IP/사용자별 요청 제한
- **Scheduled Jobs**: TTL 만료 자동 정리 (현재 Lazy Expiration)
- **다국어 지원**: 한국어 외 언어 확장
- **CSV/PDF 내보내기**: 통계/이벤트 로그 다운로드
- **지갑 복구**: 전화번호 변경 시 계정 복구 플로우

---
