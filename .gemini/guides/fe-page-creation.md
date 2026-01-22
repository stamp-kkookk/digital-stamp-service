# Gemini 가이드: 프론트엔드 페이지 생성

## Summary
- **Objective**: Use this guide to create a complete frontend page, including data fetching, state handling, and component structure.
- **Trigger**: When asked to create a new frontend page.
- **Input**: Page name, route path, UI mockup, and related APIs.

## 1. 페이지 생성 요청 접수 시 확인 사항

새로운 프론트엔드 페이지 생성 요청을 받으면, 다음 정보를 확인합니다.

1.  **페이지 이름**: 생성할 페이지의 이름은 무엇인가요?
2.  **라우트 경로**: 페이지에 할당될 URL 경로는 무엇인가요? (예: `/o/stores/:storeId/stamp-cards`)
3.  **UI 목업 디자인**: 페이지의 UI를 참고할 수 있는 이미지 파일이나 텍스트 설명이 있나요?
4.  **사용할 API**: 페이지에서 호출할 백엔드 API 엔드포인트 목록은 무엇인가요?

## 2. 페이지 구현 가이드

페이지 구현 시 다음 순서와 규칙을 준수합니다.

### 2.1. 페이지 컴포넌트 구조 설계
*   `Page` → `Container` → `View` 패턴에 따라 컴포넌트를 분리하여 설계합니다.
    *   **Page 컴포넌트**: 라우트와 직접 연결되며, Container 컴포넌트를 렌더링합니다. (`pages/...`)
    *   **Container 컴포넌트**: 데이터 페칭 및 상태 관리 로직을 담당합니다. (`components/...`)
    *   **View 컴포넌트**: 순수하게 UI 렌더링만 담당하며, Container로부터 데이터를 props로 전달받습니다. (`components/...`)

### 2.2. 데이터 페칭 및 상태 관리
*   **데이터 페칭**:
    *   `TanStack Query`의 `useQuery` 훅을 사용하여 API로부터 데이터를 가져옵니다.
    *   데이터 페칭 로직은 별도의 커스텀 훅(`hooks/...`)으로 분리하는 것을 권장합니다.
*   **상태 처리 (필수)**:
    *   **Loading 상태**: 데이터 로딩 중에는 스켈레톤 UI 또는 스피너를 표시합니다.
    *   **Empty 상태**: 조회된 데이터가 없을 경우, 사용자에게 상황을 안내하는 메시지와 다음 행동을 유도하는 CTA(Call-to-Action) 버튼을 함께 표시합니다.
    *   **Error 상태**: 데이터 로딩 실패 시, 에러 메시지와 함께 '재시도' 버튼을 제공합니다.

### 2.3. 라우팅 설정
*   `React Router` 설정 파일에 생성된 페이지 컴포넌트와 경로를 등록합니다.
*   `/skills/frontend-core.md` 가이드의 라우트 그룹핑 규칙(`/c/*`, `/o/*`, `/t/*`)을 준수합니다.

### 2.4. 접근성 및 SEO
*   페이지 `title` 태그를 페이지 내용에 맞게 동적으로 설정합니다. (예: `react-helmet-async` 사용)
*   필요에 따라 `meta description`, `og:title` 등 SEO 관련 메타 태그를 설정하는 것을 고려합니다.

### 2.5. 파일 구조 제안
*   페이지와 관련된 파일들을 기능별 디렉토리(`src/features/{feature}/`) 아래에 구성합니다.

```
src/features/{feature}/
├── pages/
│   └── {PageName}Page.tsx         # 페이지 컴포넌트
├── components/
│   ├── {PageName}Container.tsx  # 컨테이너 컴포넌트
│   └── {PageName}View.tsx       # 뷰 컴포넌트
├── hooks/
│   └── use{FeatureData}.ts      # 데이터 페칭 커스텀 훅
└── api/
    └── {feature}Api.ts          # API 호출 함수
```

## 3. 구현 단계
1.  **API 함수 정의**: `api/` 디렉토리에 API를 호출하는 함수를 작성합니다.
2.  **커스텀 훅 정의**: `hooks/` 디렉토리에 `useQuery`를 사용하는 커스텀 훅을 작성합니다.
3.  **View 컴포넌트 구현**: 목업을 기반으로 순수 UI 컴포넌트를 작성합니다.
4.  **Container 컴포넌트 구현**: 커스텀 훅을 사용하여 데이터를 가져오고, 로딩/에러/Empty 상태를 처리하여 View 컴포넌트에 데이터를 전달합니다.
5.  **Page 컴포넌트 구현**: Container 컴포넌트를 렌더링합니다.
6.  **라우터 등록**: 라우터 설정 파일에 새로운 페이지를 추가합니다.
