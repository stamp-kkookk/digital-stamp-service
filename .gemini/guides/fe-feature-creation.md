# Gemini 가이드: 프론트엔드 기능(Feature) 개발

## Summary
- **Objective**: Use this guide to systematically design and scaffold a new frontend feature from user stories and mockups.
- **Trigger**: When asked to develop a new frontend feature.
- **Input**: Feature name, user stories, UI mockups, and related API information.

## 1. 기능 개발 요청 접수 시 확인 사항

새로운 프론트엔드 기능 개발 요청을 받으면, 다음 정보를 확인합니다.

1.  **기능명**: 개발할 기능의 이름은 무엇인가요?
2.  **사용자 시나리오**: 어떤 사용자가, 어떤 목적으로, 어떤 행동을 하는지에 대한 설명이 있나요?
3.  **UI 목업 디자인**: 기능의 UI를 참고할 수 있는 이미지 파일이 있나요?
4.  **관련 API**: 이 기능과 연동할 백엔드 API가 정의되어 있나요? (없다면 "백엔드와 병행 개발"로 간주)

## 2. 기능 설계 및 구조 제안 (단계별 분석)

확인된 정보를 바탕으로, 다음 순서에 따라 기능을 분석하고 설계를 제안합니다.

### 2.1. 화면 분석
*   제공된 UI 목업 이미지를 분석하여 주요 UI 요소(버튼, 카드, 폼 등)와 전체적인 레이아웃 구조를 파악합니다.
*   사용자의 주요 인터랙션 포인트를 식별합니다.

### 2.2. 컴포넌트 분해
*   기능을 `Page` → `Container` → `View` 패턴에 따라 컴포넌트 계층 구조로 분해하여 제안합니다.
    *   **Page**: 라우트와 직접 연결되는 최상위 컴포넌트.
    *   **Container**: 데이터 페칭, 상태 관리 등 로직을 담당하는 컴포넌트.
    *   **View**: 순수하게 UI 렌더링만 담당하는 프레젠테이션 컴포넌트.

### 2.3. 상태 관리 계획
*   **서버 상태 (TanStack Query)**:
    *   데이터 조회를 위한 `useQuery` 훅을 정의합니다. (Query Key 포함)
    *   데이터 생성/수정/삭제를 위한 `useMutation` 훅을 정의합니다.
*   **클라이언트 상태 (`useState`, `useReducer`)**:
    *   UI 상호작용에 필요한 클라이언트 상태 (예: 모달 열림 여부)를 정의합니다.

### 2.4. 라우팅 경로
*   기능에 필요한 URL 경로와 파라미터를 React Router 형식으로 제안합니다.

### 2.5. API 인터페이스 추론 (필요시)
*   백엔드 API가 미확정 상태일 경우, 기능 구현에 필요한 API 엔드포인트, 요청/응답 DTO, 에러 케이스의 초안을 추론하여 백엔드 개발자와의 협업을 위한 기반을 마련합니다.

### 2.6. 파일 구조 제안
*   기능 구현에 필요한 파일 및 디렉토리 구조를 다음 템플릿에 맞춰 제안합니다.

```
src/features/{feature}/
├── api/           # API 호출 함수
├── hooks/         # Custom hooks (useQuery 래퍼 등)
├── components/    # 기능 전용 UI 컴포넌트
├── pages/         # 페이지 컴포넌트
└── types/         # 기능 관련 타입 정의
```

## 3. 설계 승인 후 구현

사용자가 위 설계 제안을 승인하면, 제안된 파일 구조에 따라 각 파일을 순차적으로 구현합니다. 구현 시에는 `frontend-core` 및 `design-system` 스킬 가이드라인을 철저히 준수합니다.
