# 로컬 개발 환경 세팅 + 매장 생성 플로우 가이드

> 새로 합류한 팀원이 로컬에서 프로젝트를 실행하고, 매장 등록부터 운영까지 직접 테스트해볼 수 있도록 안내하는 문서.

---

## 1. 사전 요구사항

| 도구 | 버전 | 확인 명령어 |
|------|------|-------------|
| Java | 17+ | `java -version` |
| Docker Desktop | 최신 | `docker --version` |
| Node.js | 18+ | `node -v` |


---

## 2. MySQL 실행

프로젝트에 포함된 Docker Compose로 MySQL을 띄운다.

```bash
cd backend
docker-compose up -d
```

컨테이너 확인:

```bash
docker ps
# kkookk-mysql 컨테이너가 healthy 상태인지 확인
```

| 항목 | 값 |
|------|-----|
| Host | localhost:3306 |
| Database | kkookkdb |
| User | kkookkuser |
| Password | kkookkpass |
| Root Password | rootpassword |

> .env에 환경 변수 세팅을 진행해야함! -> .env 없으면 슬랙에 요청하기

---

## 3. 백엔드 실행

application-local.yaml 파일 요청하기, kakao api key 추가됨

```bash
cd backend
./gradlew bootRun
```

정상 실행 확인:

```bash
# API 서버 (8080)
curl http://localhost:8080/api/public/stores
# → [] (빈 배열이면 정상)

# Swagger UI
# 브라우저에서 http://localhost:8080/swagger-ui/index.html 열기
```

---

## 4. 프론트엔드 실행

```bash
cd frontend
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속.

> `/api/*` 요청은 Vite 프록시를 통해 자동으로 `localhost:8080`으로 전달된다.

---

## 5. 매장 생성 플로우 실습

### 5.1 사장님 회원가입

1. `http://localhost:5173/owner/signup` 접속
2. 다음 정보 입력:

| 필드 | 예시 값 |
|------|---------|
| 이메일 | `owner@test.com` |
| 비밀번호 | `Test1234!` (영문 + 숫자 + 특수문자, 8~20자) |
| 이름 | `테스트점주` |
| 전화번호 | `010-1234-5678` |

3. 가입 완료 → 로그인 페이지로 이동

### 5.2 로그인

1. `http://localhost:5173/owner/login` 접속
2. 가입한 이메일/비밀번호로 로그인
3. 로그인 성공 → 매장 목록 페이지(`/owner/stores`)로 이동

### 5.3 매장 등록

1. 매장 목록에서 **"매장 추가"** 버튼 클릭
2. 매장 정보 입력:

| 필드 | 필수 | 설명 |
|------|------|------|
| 카카오 장소 검색 | 선택 | 검색어 입력 → 드롭다운에서 장소 선택. "직접 입력" 버튼으로 건너뛸 수 있음 |
| 매장명 | O | 예: `테스트 카페` |
| 주소 | 선택 | 장소 검색 시 자동 입력됨 |
| 전화번호 | 선택 | `02-1234-5678` 형식 |
| 아이콘 | 선택 | 이미지 업로드 (5MB 이하) |
| 설명 | 선택 | 매장 소개 문구 |

3. **"매장 등록하기"** 클릭 → 매장이 **DRAFT** 상태로 생성됨
4. 자동으로 스탬프 카드 생성 페이지로 이동

### 5.4 스탬프 카드 생성

매장 생성 직후 스탬프 카드 설정 화면이 뜬다.

1. 카드 이름, 필요 스탬프 수, 리워드 등을 입력
2. **"생성"** 클릭 → 카드가 자동으로 **ACTIVE** 상태로 전환됨
3. 매장 상세 페이지로 이동 + 성공 메시지 표시

> "건너뛰기"를 누르면 스탬프 카드 없이 매장만 등록된다. 나중에 매장 상세에서 추가 가능.

### 5.5 매장 상태 확인

매장 상세 페이지(`/owner/stores/:id`)에서:

- **"승인 대기"** 배지가 표시됨 (DRAFT 상태)
- "운영팀에 문의하여 매장 승인을 요청하세요" 안내 배너
- 아직 LIVE가 아니므로 고객 적립/리딤/터미널 로그인 불가

---

## 6. Admin 승인 (DRAFT → LIVE)

### 6.1 Admin 계정 만들기

일반 사장님 계정의 `admin` 플래그를 DB에서 직접 변경한다.

```sql
-- MySQL 접속
docker exec -it kkookk-mysql mysql -ukkookkuser -pkkookkpass kkookkdb

-- admin 플래그 설정 (owner@test.com 계정을 admin으로)
UPDATE owner_account SET admin = true WHERE email = 'owner@test.com';

-- 확인
SELECT id, email, name, admin FROM owner_account;
```

> 변경 후 **재로그인** 해야 JWT에 admin claim이 반영된다.

### 6.2 Admin 페이지에서 승인

1. 로그아웃 후 다시 로그인 (admin claim 갱신)
2. 브라우저에서 `http://localhost:5173/admin/stores` 직접 접속
3. 상태 필터에서 **"승인 대기"** 선택 → DRAFT 매장 목록 확인
4. 매장 클릭 → 상세 페이지

상세 페이지에서 확인할 것:
- **승인 체크리스트**: 활성 스탬프카드 등록 여부 (초록 체크 / 노란 경고)
- 매장 정보, 점주 정보

5. **"승인"** 버튼 클릭 → DRAFT → **LIVE**

### 6.3 승인 완료 확인

- Owner 매장 목록: 상태 배지가 **"영업중"**(초록)으로 변경
- 고객 매장 목록(`/api/public/stores`)에 노출됨
- 터미널 로그인, 스탬프 적립/리딤 가능

---

## 7. 전체 플로우 요약

```
[사장님]                  [Admin]                   [고객]
   |                        |                        |
회원가입 + 로그인             |                        |
   |                        |                        |
매장 등록 (DRAFT)            |                        |
   |                        |                        |
스탬프 카드 생성 (ACTIVE)     |                        |
   |                        |                        |
   |-------- 승인 요청 ----->|                        |
   |                        |                        |
   |          매장 승인 (LIVE)|                        |
   |                        |                        |
   |                        |   매장 검색 + 적립/리딤   |
   |                        |                        |
```

---

## 8. 추가 테스트 시나리오

### 카카오 장소 미연동 매장

- 매장 생성 시 "직접 입력"으로 등록하면 `placeRef = null`
- 목록/상세에서 **"장소 미연동"** 라벨 표시
- 매장 수정 페이지에서 카카오 장소 검색으로 연동 가능

### 매장 삭제

- 매장 상세 페이지 우측 상단 **"삭제"** 버튼
- DRAFT 또는 LIVE 상태에서만 삭제 가능
- 삭제 후 복구 불가 (DELETED 상태)

### 매장 정지/해제 (Admin)

- Admin 매장 상세에서 **"정지"** 버튼 → 사유 입력 → SUSPENDED
- 정지된 매장: 고객 노출 X, 적립/리딤 X
- **"정지 해제"** 버튼 → LIVE 복원

---

## 트러블슈팅

```
### 로그인 후 Admin 페이지 접근 불가 (403)

DB에서 admin 플래그를 설정한 후 **재로그인**이 필요하다. JWT 토큰에 admin claim이 포함되어야 한다.

### 카카오 장소 검색이 안 됨

`application-local.yaml`의 `kakao.rest-api-key`가 유효한지 확인. 키가 만료되었으면 [Kakao Developers](https://developers.kakao.com/)에서 새로 발급.
```