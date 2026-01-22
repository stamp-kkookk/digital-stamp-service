# Gemini Design System Directives: Kkookk Frontend

## Summary
- **Objective**: Implement and maintain a consistent, accessible, and mobile-first UI for the Kkookk frontend using Tailwind CSS.
- **Scope**: Styling components, layouts, interactions, accessibility (a11y).
- **Key Principles**: Tactile Certainty, Paperless Freedom, Human Bridge.

## 1. 이 스킬 사용 시점

Kkookk 프론트엔드 UI/UX를 구현하거나 수정할 때 이 지시사항을 준수합니다.
*   Tailwind CSS를 사용하여 컴포넌트 스타일링
*   레이아웃 및 사용자 상호작용 구현
*   접근성(a11y) 기능 추가
*   모바일 우선 웹 UI 구축

## 2. Core Design Principles

1.  **물리적 확신 (Tactile Certainty)**: 시각적 피드백을 통해 실제 스탬프와 같은 감각을 재현합니다.
2.  **지갑의 자유 (Paperless Freedom)**: 가볍고 설치가 필요 없는 모바일 우선 PWA 경험을 제공합니다.
3.  **연결의 가치 (Human Bridge)**: 점주와 고객 간의 따뜻한 디지털 연결을 지향합니다.

## 3. Tailwind CSS 규칙

### 색상 및 테마 설정
*   **모든 커스텀 색상**: `tailwind.config.js`가 아닌, **`index.css` 파일 내의 `@theme` 블록**에서 `--color-kkookk-*` 변수로 정의합니다. 작업 시 항상 이 파일을 참조합니다.

### 모바일 우선 접근 방식
*   기본 스타일은 모바일(375px 너비 기준)을 대상으로 작성합니다.
*   더 큰 화면을 위한 스타일은 `md:`, `lg:`와 같은 반응형 접두사를 사용합니다.

### 클래스 순서 (중요)
Tailwind 클래스는 항상 다음 순서로 작성하여 일관성을 유지합니다.
1.  **Layout** (flex/grid, position, display)
2.  **Spacing** (p/m/gap)
3.  **Size** (w/h)
4.  **Typography** (text-*, font-*)
5.  **Colors** (bg-*, text-*, border-*)
6.  **Effects** (shadow, rounded, opacity)
7.  **States** (hover:, focus:, active:, disabled:)

### 동적 클래스
*   `clsx` 또는 `tailwind-merge`를 사용하여 동적 클래스 조합을 관리합니다.

### 패턴 추출 규칙
*   동일한 클래스 조합이 **3번 이상** 반복되면, 재사용 가능한 컴포넌트 또는 `@layer utilities`에 커스텀 유틸리티 클래스로 추출합니다.

### 간격 (Spacing)
*   Tailwind의 4px 기반 스케일(`p-2`, `gap-4` 등)을 사용하고, `style` 속성을 이용한 인라인 스타일링을 피합니다.

## 4. 색상 시스템 (Kkookk 전용)

### 주요 색상 사용 규칙
*   **주요 CTA**: `bg-kkookk-orange-500`
*   **흰 배경 위 텍스트**: 가독성을 위해 `text-kkookk-orange-900` 사용
*   **점주 UI**: `kkookk-indigo`와 `kkookk-steel` 색상 중심
*   **고객 UI**: `kkookk-sand`와 `kkookk-yellow` 색상 중심
*   **전역 배경**: `kkookk-paper`
*   **본문 텍스트**: `kkookk-navy`
*   **에러**: `kkookk-red`
*   **경고**: `kkookk-amber`
*   **대비**: WCAG AAA (7:1) 이상의 명도 대비를 준수합니다.

## 5. 타이포그래피 (Pretendard 글꼴 필수)

### 글꼴 설정
*   `<body>` 태그에 `font-pretendard` 클래스를 적용합니다.

### 타입 스케일 및 가중치
*   **Display**: `text-6xl`, `text-4xl` (ExtraBold 800) - 스탬프 개수 등 강조
*   **Heading**: `text-2xl`, `text-xl` (SemiBold 600) - 페이지/섹션 제목
*   **Body**: `text-base` (Medium 500), `text-sm` (Regular 400) - 본문 및 보조 텍스트
*   **Caption**: `text-xs` (Regular 400) - 타임스탬프 등

## 6. 주요 컴포넌트 명세

### 핵심 CTA 버튼
```tsx
<button className="h-14 px-6 rounded-2xl bg-kkookk-orange-500 text-white font-semibold active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
  스탬프 적립
</button>
```
*   **높이**: `h-14` (56px) - 터치 실수 방지
*   **상태**: `active:scale-95`로 물리적 피드백 제공
*   **더블 탭 방지**: 클릭 후 300ms 동안 비활성화 처리 필수 (아래 '상호작용' 참조)

## 7. 상호작용 및 애니메이션

### 시그니처 애니메이션
*   **스탬프 찍기**: `framer-motion`을 사용하여 `scale: [0.8, 1.1, 1.0]` 애니메이션 적용
*   **페이지 전환**: 오른쪽에서 슬라이드인 (`initial={{ x: '100%' }}`)
*   **모달**: 아래에서 슬라이드업 (`initial={{ y: '100%' }}`)
*   **폴링 대기**: `scale`과 `opacity`를 반복하는 펄스 애니메이션 적용

### 더블 탭 방지 (CTA 버튼 필수)
`useState`를 사용하여 처리 중(`isProcessing`) 상태를 관리하고, 클릭 이벤트 발생 시 `isProcessing`이 `true`이면 즉시 반환합니다. `try...finally` 블록을 사용하여 액션 완료 후 `setTimeout`으로 300ms 뒤에 `isProcessing`을 `false`로 설정합니다.

## 8. 접근성 (Accessibility - A11y)

### 최소 요구사항
*   모든 `input`에 `label` 제공
*   `focus:ring-4`와 같이 명확한 포커스 상태 제공
*   `aria-label`, `aria-modal` 등 적절한 ARIA 속성 사용
*   터치 영역은 최소 44x44px, Kkookk 표준은 **56px (h-14)**
