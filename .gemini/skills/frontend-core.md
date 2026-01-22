# Gemini Frontend Core Directives: Kkookk Client

## Summary
- **Objective**: Build robust and maintainable React components, pages, and state management for the Kkookk frontend.
- **Scope**: Component creation, data fetching, state management, forms, routing.
- **Key Principles**: Mandatory confirmation for critical actions, clear state branching, consistent architecture.

## 1. 이 스킬 사용 시점

Kkookk 프로젝트의 `frontend/` 디렉토리 내에서 다음 작업을 수행할 때 이 지시사항을 준수합니다:
*   React 컴포넌트 또는 페이지 생성
*   유효성 검사를 포함한 폼 구현
*   데이터 페칭 또는 상태 관리 설정
*   라우팅 (`/c`, `/o`, `/t`) 작업

## 2. 필수 요구사항: 되돌릴 수 없는 작업 확인 (MANDATORY)

### '보상 사용 (Redeem)' 흐름
'사용 처리'와 같이 되돌릴 수 없는 작업을 수행할 때는, 사용자의 실수를 방지하기 위해 반드시 **2단계 확인 모달**을 구현해야 합니다.

*   **모달 내용**:
    *   **제목**: "되돌릴 수 없는 작업입니다"
    *   **본문**: "매장 직원이 확인 후 눌러주세요"
    *   **버튼**: [취소] / [확인]
*   **TTL 적용**: 모달이 30-60초 내에 확인되지 않으면 자동으로 만료 처리하고 "요청이 만료되었습니다" 메시지를 표시해야 합니다.

## 3. 기술 스택 및 라이브러리 정책

### 기본 스택
*   React + TypeScript + Vite
*   Tailwind CSS
*   React Router
*   TanStack Query
*   Axios
*   React Hook Form + Zod

### 라이브러리 추가 정책
새로운 라이브러리를 추가하려면, 명확한 이점과 작은 용량을 증명하고 최소 하나의 사용 예시를 제시해야 합니다.

## 4. 아키텍처

### 사용자 유형별 뷰포트
*   **고객 지갑**: 모바일 우선
*   **점주 백오피스**: 데스크톱 우선
*   **상점 단말기**: 상시 표시되는 승인 화면

### 컴포넌트 구성 패턴
`Page` (라우트 레벨) → `Container` (데이터 및 상태 로직) → `View` (순수 프레젠테이션) 패턴을 따릅니다.

### 파일 구성
*   `src/components/`: 공통 UI 요소
*   `src/features/<feature>/components/`: 특정 기능 전용 UI

## 5. 코드 스타일

### 기본 원칙
*   **Airbnb JavaScript Style Guide**를 따르되, 다음을 준수합니다:
    *   들여쓰기: 4칸 스페이스
    *   최대 라인 길이: 120자
    *   세미콜론: 사용 안 함

### 네이밍 컨벤션
*   **컴포넌트/파일**: `PascalCase` (예: `UserProfile.tsx`)
*   **변수/함수/훅**: `camelCase`
*   **상수**: `SCREAMING_SNAKE_CASE`
*   **Boolean**: `is`, `has`, `can`, `should` 접두사 사용
*   **이벤트 핸들러**: 함수는 `handle*`, props는 `on*` (예: `<Button onClick={handleOpen} />`)

### 컴포넌트 내부 순서
1.  상태 선언 (`useState`)
2.  메모이제이션 (`useMemo`, `useCallback`)
3.  사이드 이펙트 (`useEffect`)
4.  이벤트 핸들러
5.  JSX 렌더링

### TypeScript 규칙
*   `any` 타입 사용을 **절대 금지**합니다 (`unknown` 사용).
*   객체(Props, API 응답)에는 `interface`를 사용합니다.
*   유니온/별칭에는 `type`을 사용합니다.
*   `enum` 대신 `as const`를 사용합니다.

## 6. 상태 분기 (필수)

모든 페이지는 반드시 다음 세 가지 상태를 처리해야 합니다:
*   **로딩 (Loading)** 상태
*   **데이터 없음 (Empty)** 상태
*   **에러 (Error)** 상태 (재시도 액션 포함)

## 7. 상태 및 데이터 페칭

### TanStack Query 패턴
*   데이터 조회: `useQuery`
*   데이터 변경: `useMutation`
*   `mutation` 성공 시 관련된 `query`들을 무효화(invalidate) 처리합니다.

### 폴링 (필수)
스탬프 발급 승인 상태, 단말기 목록 등은 반드시 폴링을 지원해야 합니다.
*   **기본 주기**: 2-3초
*   **중지 조건**: 상태가 최종 완료되거나 TTL이 만료될 때

## 8. 폼 및 유효성 검사

*   폼: `react-hook-form` 사용
*   유효성 검사: `zod` 스키마 사용
*   **UX 요구사항**: 필드 근처에 에러 메시지를 표시하고, 로딩 중에는 제출 버튼을 비활성화하며, 중복 제출을 방지합니다.

## 9. 임포트 규칙

### 절대 경로 사용
`@/` 접두사를 사용하여 `components/`, `hooks/` 등 주요 디렉토리를 참조합니다.

### 임포트 정렬 순서
1.  React 라이브러리
2.  서드파티 라이브러리
3.  전역/공통 컴포넌트
4.  도메인/기능별 컴포넌트
5.  훅, 유틸리티, 타입
6.  에셋 (이미지, CSS)

## 10. 린팅 및 포매팅

**도구**: ESLint, Prettier, Husky, lint-staged를 사용하여 커밋 전에 코드 품질과 스타일을 자동으로 검증합니다.
```
---

