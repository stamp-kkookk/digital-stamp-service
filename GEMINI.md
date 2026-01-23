# GEMINI Project Guide: Kkookk Digital Stamp Service
아래 모든 지침을 빠짐없이 확인하고 준수한다.

## 1) Project scope
KKOOKK 디지털 스탬프/리워드 SaaS (POS 연동 없음)

- frontend/: React + TS + Tailwind (Customer / Owner Backoffice / Terminal UI)
- backend/ 또는 server/: Spring Boot API (Java 17, MySQL)

> 폴더명이 혼재되어 있으면, 실제 레포에 존재하는 폴더를 우선한다.  
> (예: server/가 없고 backend/가 있으면 backend/ 기준)

---

## 2) Single source of truth: `.claude`
이 프로젝트의 작업 규칙은 `.claude`에 정의되어 있으며,
**참고가 아니라 반드시 그대로 준수**한다.

필수 로드 순서:
1) `.claude/CLAUDE.md` (Root workflow + DoD)
2) 작업 영역별 CLAUDE:
   - 프론트 작업: `frontend/CLAUDE.md`
   - 백엔드 작업: `backend/CLAUDE.md` 또는 `server/CLAUDE.md`
3) 필요한 skills/commands를 요청 유형에 맞게 선택 적용:
   - `.claude/skills/**/SKILL.md`
   - `.claude/commands/*.md`

응답에는 항상 아래를 포함한다:
- 이번 작업에 적용한 `.claude` 파일 목록
- 적용한 핵심 규칙 요약(1~3줄)

---

## 3) Mandatory workflow (Design → Review → Implement → Test)
**Never jump straight into code.**

요청 처리 순서:
1) 2~3개의 설계 옵션 제시
2) trade-off / 리스크 비교
3) 1개 옵션 추천 (선택 이유 포함)
4) 구현은 file-by-file diff 단위로 제시
5) 테스트 + 검증 체크리스트 제공

> 큰 작업은 phase로 분리하고, 필요 시 컨텍스트를 리셋한다. (예: `/clear`)

---

## 4) Definition of Done (항상 체크)
- lint passes
- test passes
- No TODO in changed files
- Error handling exists
- **Error response format consistent**
- API contracts documented (DTO + status codes)
- No breaking change unless explicitly stated
- 관련 문서 업데이트

---

## 5) STOP & Ask before proceeding (조건부 질문)
아래 상황에서는 멈추고 질문한다:
- 요구사항 모호 / 비즈니스 룰 추론 필요
- 인증/보안/결제 관련
- PRD 동작 변경 가능성
- 기존 API breaking 가능성
- DB 스키마 변경/마이그레이션/데이터 손실 위험

---

## 6) Frontend rules (요약)
- 반드시 `.claude/skills/frontend-core` (+ design-system) 준수
- 모든 페이지에 loading/empty/error 상태 포함
- Page → Container → Presentational 분리
- **접근성(a11y) 기본 준수 (label/aria/focus ring)**
- **전역 상태 저장소는 요구되지 않으면 도입 금지**
- API는 `src/lib/api/*`로만 호출, TanStack Query 사용
- Form은 React Hook Form + Zod
- 새 라이브러리 도입 금지(필요 시 근거 제시)

---

## 7) Backend rules (요약)
- layered architecture (Controller/Service/Repo)
- Swagger(OpenAPI) 사용, Controller는 Interface로 Swagger 분리
- API 작업 순서: API list → DTOs → DB tables → errors → steps → tests → code
- MockMvc 테스트는 성공/실패 + 에러 포맷 보장 중심

> Swagger/OpenAPI 정책은 **server/CLAUDE.md 및 `.claude` 규칙을 우선**하며, 해당 규칙과 충돌하는 자체 판단을 금지한다.

---

## 8) Backend Commands/Skills 적용 규칙 (강제)
백엔드 작업에서는 아래 규칙을 **반드시** 따른다.

### 8.1 API 설계 요청이면 (/be-api)
- `.claude/commands/be-api.md` 템플릿을 따라 출력한다.
- 또한 `.claude/skills/backend-core/SKILL.md`의 **API Design (Required Output Format)** 구조를 그대로 따른다:

1) Endpoints (method/path/auth/status codes)  
2) Request/Response DTOs  
3) DB Model (tables + main columns, 필요 시 index)  
4) Validation & Exceptions  
5) Implementation Steps (Controller → Service → Repository)  
6) Test Cases (success + failure)  
7) Checklist

### 8.2 구현 요청이면 (/be-impl)
- 구현은 반드시 **이전 `/be-api` 산출물**이 존재할 때만 진행한다.
- `/be-api` 산출물이 없으면 먼저 설계를 요청하거나 `/be-api`를 수행한다.
- 구현 순서는 `.claude/commands/be-impl.md`를 **강제**한다:

Entity → Repository → Service → DTO → Controller → Exception

- 결과물은 레이어별 코드 스니펫을 제공하되,
  **파일 단위(diff 느낌)로** 변경 범위를 분명히 제시한다.
- 구현 완료 후, `.claude` 기준에 맞춰 **최소 1 success + 1 failure 테스트 작성(/be-test)**을 다음 단계로 수행한다.

### 8.3 보안/OTP 규칙 (backend-core CRITICAL)
- **Redeem(사용하기) 등 gated action은 OTP step-up 검증을 백엔드에서 강제**한다.
- 클라이언트의 `otpVerified` 같은 플래그는 절대 신뢰하지 않는다.
- Service 레이어에서 `OtpSession.isValid()`를 검증한다.
- 실패 시 `403` + `"OTP_REQUIRED"` 에러 코드를 반환한다.
- OTP 세션 TTL은 약 10분을 기본으로 한다.

### 8.4 추가 보안 가드레일
- phone + name 조회는 brute-force 위험 → rate limit / cooldown 고려
- Owner 전용 endpoint는 인증 보호가 기본
- Terminal이 Owner 세션 공유(MVP 허용)하더라도 모든 issuance/redeem/migration 액션을 audit logging 한다

---

## 9) Output 품질 기준
목표는 “Gemini 스타일”이 아니라 **Claude와 동일한 외부 결과물**이다.

즉, 동일한:
- 판단 기준
- 제약 조건
- 응답 구조(포맷)
- 디테일 수준
을 유지한다.