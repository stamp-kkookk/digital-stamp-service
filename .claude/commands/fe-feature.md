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
- 로컬 이미지 파일 경로를 전달하면 Read 도구로 이미지를 분석합니다.

### 4. 관련 API
(있으면 명시, 없으면 "백엔드 병행 개발"로 표기)

---

## Output 요구사항

이 command를 실행하면 다음 순서로 분석 및 설계를 진행합니다:

### 1. 화면 분석 (목 디자인 이미지 기준)
- UI 요소 식별 (버튼, 카드, 폼, 리스트 등)
- 레이아웃 구조 파악
- 사용자 인터랙션 포인트 정리

### 2. 컴포넌트 분해 (Page → Container → View)
- Page: 라우트 레벨 컴포넌트
- Container: 데이터 fetch + 상태 관리
- View: 순수 프레젠테이션 컴포넌트

### 3. 상태 관리 계획 (TanStack Query hooks)
- 필요한 useQuery hooks 정의
- useMutation hooks 정의 (CUD 작업용)
- Query key 구조 제안

### 4. 라우팅 경로 제안
- React Router 경로 구조
- URL 파라미터 정의

### 5. API 인터페이스 추론 (백엔드 개발자와 협의용)
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

## 사용 예시

```
/fe-feature StampCard 목록

유저 시나리오:
- 점주가 백오피스에서 자신의 매장 스탬프카드 목록을 조회한다
- 각 카드의 상태(활성/비활성)를 확인할 수 있다
- 새 스탬프카드를 생성하는 버튼이 있다

UI 목 디자인: ./mocks/backoffice-stampcard-list.png

관련 API: GET /api/owner/stores/{storeId}/stamp-cards
```

---

## 주의사항

1. **Mobile-first**: Customer 화면은 모바일 우선, Owner 화면은 데스크톱 우선
2. **상태 분기**: 모든 페이지에서 Loading/Empty/Error 상태 처리 필수
3. **API 미확정 시**: 백엔드 병행 개발이면 인터페이스 초안을 먼저 정의
4. **컴포넌트 재사용**: 공통 컴포넌트는 `src/components/`에 배치
