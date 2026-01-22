# Gemini 가이드: 프론트엔드 컴포넌트 생성

## Summary
- **Objective**: Use this guide to create reusable, well-structured, and styled React components.
- **Trigger**: When asked to create a new frontend component.
- **Input**: Component name, purpose, props, and UI references.

## 1. 컴포넌트 생성 요청 접수 시 확인 사항

새로운 프론트엔드 컴포넌트 생성 요청을 받으면, 다음 정보를 확인합니다.

1.  **컴포넌트명**: 생성할 컴포넌트의 이름은 무엇인가요? (`PascalCase` 형식)
2.  **목적**: 컴포넌트의 주요 역할은 무엇인가요? (예: 버튼, 카드, 모달, 폼 필드)
3.  **Props 인터페이스**: 컴포넌트가 받을 props의 목록과 각 타입은 무엇인가요?
4.  **UI 참고 자료**: 컴포넌트의 디자인을 참고할 수 있는 목업 이미지나 텍스트 설명이 있나요?

## 2. 컴포넌트 구현 가이드

컴포넌트 구현 시 다음 규칙과 순서를 준수합니다.

### 2.1. 컴포넌트 파일 위치
*   **공통 컴포넌트**: 2개 이상의 기능(feature)에서 재사용될 경우 `src/components/`에 생성합니다.
*   **기능 전용 컴포넌트**: 특정 기능에서만 사용될 경우 `src/features/{feature}/components/`에 생성합니다.

### 2.2. 컴포넌트 구조
*   **함수형 컴포넌트**: TypeScript를 사용한 함수형 컴포넌트로 작성합니다.
*   **Props 타입 정의**: 컴포넌트 파일 상단에 `interface`를 사용하여 명시적인 Props 타입을 정의합니다. `any` 타입 사용은 금지됩니다.
*   **컴포넌트 내부 순서**: 다음 순서를 따릅니다.
    1.  상태 선언 (`useState`)
    2.  메모이제이션 (`useMemo`, `useCallback`)
    3.  사이드 이펙트 (`useEffect`)
    4.  이벤트 핸들러
    5.  JSX 렌더링
*   **`forwardRef`**: 부모 컴포넌트에서 DOM에 직접 접근해야 할 경우(예: input 포커스)에만 `forwardRef`를 적용합니다.

### 2.3. 스타일링
*   `/skills/design-system.md` 가이드의 모든 규칙을 준수합니다.
    *   **Tailwind CSS 클래스 순서** (Layout → Spacing → Size → ...)
    *   프로젝트의 **KKOOKK 컬러 시스템** 사용
    *   동적 클래스는 **`twMerge`** 또는 `clsx` 사용
    *   **모바일 우선** 접근 방식 적용

### 2.4. 접근성 (Accessibility)
*   `/skills/design-system.md` 가이드의 접근성 규칙을 준수합니다.
    *   의미에 맞는 HTML 태그 사용
    *   필요한 경우 ARIA 속성 추가
    *   명확한 포커스 상태 제공

## 3. 코드 생성 예시

요청:
```
컴포넌트명: PrimaryButton
목적: 주요 CTA 버튼
Props:
- children: React.ReactNode
- onClick: () => void
- isDisabled?: boolean
```

출력 (`src/components/PrimaryButton.tsx`):
```tsx
import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
}

export const PrimaryButton = ({ children, onClick, isDisabled }: PrimaryButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={twMerge(
        'flex items-center justify-center gap-2 h-14 px-6 text-base font-semibold bg-kkookk-orange-500 text-white rounded-2xl shadow-md transition-all',
        'hover:shadow-lg',
        'active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
};
```
