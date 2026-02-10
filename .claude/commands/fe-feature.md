# Feature Development Prompt

> 피처 단위 개발을 위한 핵심 command입니다.
> 유저 시나리오 + UI 목 디자인을 기반으로 피처 전체를 설계합니다.

---

## Input 필수 항목

### 1. 피처명
$ARGUMENTS

### 2. 유저 시나리오
(사용자가 직접 제공 - 어떤 사용자가 어떤 목적으로 어떤 행동을 하는지)

### 3. UI 목 디자인
(이미지 파일 경로 제공, 예: `./mocks/stampcard-list.png`)

### 4. 관련 API
(있으면 명시, 없으면 "백엔드 병행 개발"로 표기)

---

## 참조 문서 (작업 전 확인)

- `docs/api-reference.md` - 사용 가능한 API 엔드포인트
- `docs/utility-registry.md` (Frontend 섹션) - 기존 코드 중복 방지
- `docs/feature-specs/{feature}.md` - 해당 피처 명세
- `frontend/src/lib/api/endpoints.ts` - API_ENDPOINTS & QUERY_KEYS
- `frontend/src/types/api.ts` - API DTO 타입
- `.claude/skills/frontend-core/SKILL.md` - 아키텍처, 코드 스타일
- `.claude/skills/design-system/SKILL.md` - 디자인 시스템

---

## Output 요구사항

### 1. 화면 분석 (목 디자인 이미지 기준)
- UI 요소 식별 (버튼, 카드, 폼, 리스트 등)
- 레이아웃 구조 파악
- 사용자 인터랙션 포인트 정리

### 2. 컴포넌트 분해 (Page -> Container -> View)
- Page: 라우트 레벨 컴포넌트
- Container: 데이터 fetch + 상태 관리
- View: 순수 프레젠테이션 컴포넌트

### 3. 상태 관리 계획 (TanStack Query hooks)
- 필요한 useQuery hooks 정의
- useMutation hooks 정의 (CUD 작업용)
- Query key 구조 제안 (QUERY_KEYS 기준)

### 4. 라우팅 경로 제안
- React Router 경로 구조 (/c/*, /o/*, /t/*)
- URL 파라미터 정의

### 5. API 인터페이스 추론 (백엔드 병행 시)
- 필요한 엔드포인트 목록
- Request/Response DTO 초안
- 에러 케이스 정의

### 6. 파일 구조 제안
```
src/features/{feature}/
├── api/           # API 호출 함수
├── hooks/         # Custom hooks (useQuery 래퍼)
├── components/    # 피처 전용 컴포넌트
├── pages/         # 페이지 컴포넌트
└── types/         # 타입 정의
```

---

## 체크리스트

- [ ] Loading / Empty / Error 상태 처리
- [ ] Mobile-first 레이아웃 (Customer: 모바일, Owner: 데스크톱, Terminal: 태블릿)
- [ ] 접근성(A11y) 가이드라인 준수
- [ ] API 에러 핸들링 존재
- [ ] `docs/utility-registry.md`에 등록된 기존 코드와 중복 없음
- [ ] API 미확정 시 인터페이스 초안 먼저 정의
