# Gemini Frontend Testing Directives: Kkookk Client

## Summary
- **Objective**: Implement and review frontend tests using Vitest and React Testing Library, focusing on user behavior.
- **Scope**: Component tests, user interaction tests, form tests.
- **Key Principles**: Test user behavior, not implementation details.

## 1. 이 스킬 사용 시점

Kkookk 프론트엔드 개발 중 다음 작업을 수행할 때 이 지시사항을 준수합니다:
*   컴포넌트 렌더링 테스트 작성
*   사용자 상호작용(클릭, 입력 등) 테스트 작성
*   폼, 로딩 상태, 에러 처리 등 비동기 로직 테스트 작성
*   프론트엔드 테스트 코드 품질 검토

## 2. 테스트 스택

*   **테스트 러너/환경**: Vitest
*   **테스팅 라이브러리**: React Testing Library
*   **사용자 이벤트 시뮬레이션**: `@testing-library/user-event`
*   **핵심 원칙**: 구현 세부사항보다는 **사용자 행위**를 중심으로 테스트합니다.

## 3. 최소 요구 사항

*   주요 페이지 및 컴포넌트는 최소한 다음 테스트를 포함해야 합니다.
    *   **정상 경로 렌더링 테스트 1개**: 컴포넌트가 의도대로 렌더링되는지 확인합니다.
    *   **(해당 시) 에러/데이터 없음 상태 테스트 1개**: 에러 또는 데이터 없음 상태가 올바르게 렌더링되는지 확인합니다.

## 4. 테스트 우선순위

1.  **핵심 기능 흐름**: 보상 사용(redeem), 스탬프 발급(issuance) 등 가장 중요한 사용자 시나리오
2.  **폼 제출**: 사용자가 데이터를 입력하고 제출하는 모든 폼
3.  **로딩/에러 상태**: 비동기 데이터 요청에 따른 UI 상태 변화
4.  **사용자 상호작용**: 버튼 클릭, 탭 전환 등 주요 인터랙션

## 5. 테스트 파일 위치

테스트 파일은 테스트 대상 컴포넌트가 속한 기능 디렉토리 아래의 `__tests__` 폴더에 위치시킵니다.

```
src/features/{feature}/__tests__/
├── {Component}.test.tsx
└── {Container}.test.tsx
```

## 6. 테스트 패턴

### 6.1. 기본 렌더링 테스트
*   `render` 함수로 컴포넌트를 렌더링합니다.
*   `screen` 객체와 `getBy*` 쿼리를 사용하여 특정 텍스트나 역할(role)을 가진 요소가 문서에 존재하는지 확인합니다.

```tsx
// 예시: UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

describe('UserProfile', () => {
  it('사용자 이름을 올바르게 렌더링해야 한다', () => {
    render(<UserProfile name="홍길동" />);
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });
});
```

### 6.2. 사용자 상호작용 테스트
*   `userEvent`를 사용하여 클릭, 타이핑 등 실제 사용자 행동을 시뮬레이션합니다.
*   `vi.fn()`으로 모의(mock) 함수를 만들어 이벤트 핸들러가 올바르게 호출되었는지 검증합니다.

```tsx
// 예시: LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

it('폼 제출 시 onSubmit 함수가 호출되어야 한다', async () => {
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);

  await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: '제출' }));

  expect(handleSubmit).toHaveBeenCalled();
});
```
