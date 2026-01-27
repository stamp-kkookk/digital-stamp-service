# KKOOKK Component Library

> **Version**: 1.0.0
> **Last Updated**: 2026-01-27

A collection of reusable React components built with TypeScript, Tailwind CSS, and the KKOOKK Design System.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [UI Components](#ui-components)
3. [Form Components](#form-components)
4. [Layout Components](#layout-components)
5. [State Views](#state-views)
6. [Best Practices](#best-practices)

---

## Getting Started

### Installation

All components are located in `src/components/` and can be imported directly:

```tsx
import { Button, Input, Card } from '@/components/ui';
import { PhoneInput, OtpInput } from '@/components/form';
import { Container, Stack } from '@/components/layout';
```

### Dependencies

- **react**: ^19.2.0
- **react-hook-form**: ^7.71.1
- **zod**: ^4.3.5
- **class-variance-authority**: Latest
- **framer-motion**: ^12.27.2

---

## UI Components

### Button

A versatile button component with multiple variants and sizes.

**Import:**
```tsx
import { Button } from '@/components/ui/Button';
```

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // ... extends HTMLButtonElement props
}
```

**Examples:**

```tsx
// Primary button (default)
<Button variant="primary" size="md">
  제출
</Button>

// Secondary button with loading state
<Button variant="secondary" isLoading={true}>
  처리 중...
</Button>

// Outline button with icon
<Button variant="outline" leftIcon={<PlusIcon />}>
  추가하기
</Button>

// Ghost button
<Button variant="ghost" size="sm">
  취소
</Button>

// Danger button
<Button variant="danger">
  삭제
</Button>
```

**Variants:**
- **primary**: Orange background, main actions
- **secondary**: Indigo background, Owner persona
- **outline**: Orange border, secondary actions
- **ghost**: Transparent, tertiary actions
- **danger**: Red background, destructive actions

**Sizes:**
- **sm**: 40px height (h-10)
- **md**: 56px height (h-14) - default
- **lg**: 64px height (h-16)

---

### Input

A styled input component with label, error message, and helper text support.

**Import:**
```tsx
import { Input } from '@/components/ui/Input';
```

**Props:**
```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
  inputSize?: 'sm' | 'md';
  maxLength?: number;
  showCharCount?: boolean;
  // ... extends HTMLInputElement props
}
```

**Examples:**

```tsx
// Basic input with label
<Input
  label="이름"
  placeholder="홍길동"
  {...register('name')}
/>

// Input with error
<Input
  label="이메일"
  type="email"
  error="유효한 이메일을 입력해주세요"
/>

// Input with character count
<Input
  label="닉네임"
  maxLength={10}
  showCharCount
/>

// Input with icons
<Input
  leftIcon={<SearchIcon />}
  placeholder="검색"
/>

// Filled variant
<Input
  variant="filled"
  placeholder="검색어 입력"
/>
```

---

### Card

A container component with elevation and padding variants.

**Import:**
```tsx
import { Card } from '@/components/ui/Card';
```

**Props:**
```typescript
interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  // ... extends HTMLDivElement props
}
```

**Examples:**

```tsx
// Default card
<Card variant="default" padding="md">
  <h3>제목</h3>
  <p>내용</p>
</Card>

// Bordered card
<Card variant="bordered" padding="lg">
  내용
</Card>

// Elevated card (with hover effect)
<Card variant="elevated" padding="md" onClick={handleClick}>
  클릭 가능한 카드
</Card>

// Card with no padding
<Card padding="none">
  <img src="/image.jpg" alt="이미지" />
  <div className="p-4">내용</div>
</Card>
```

---

### Badge

A small label component for status indicators.

**Import:**
```tsx
import { Badge } from '@/components/ui/Badge';
```

**Props:**
```typescript
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  // ... extends HTMLSpanElement props
}
```

**Examples:**

```tsx
// Success badge
<Badge variant="success">활성</Badge>

// Warning badge
<Badge variant="warning">대기중</Badge>

// Danger badge
<Badge variant="danger">거절</Badge>

// Info badge
<Badge variant="info" size="sm">NEW</Badge>
```

---

### Modal

An accessible modal dialog with animations.

**Import:**
```tsx
import { Modal } from '@/components/ui/Modal';
```

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}
```

**Example:**

```tsx
const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)}>모달 열기</Button>

  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="확인"
    size="md"
  >
    <p>정말 삭제하시겠습니까?</p>
    <div className="mt-4 flex gap-2 justify-end">
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        취소
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        삭제
      </Button>
    </div>
  </Modal>
</>
```

**Features:**
- ESC key to close
- Background overlay
- Focus trap
- Animated entrance/exit
- Prevents body scroll

---

## Form Components

### FormField

A wrapper for react-hook-form Controller with automatic error handling.

**Import:**
```tsx
import { FormField } from '@/components/form/FormField';
```

**Props:**
```typescript
interface FormFieldProps<T> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  rules?: RegisterOptions<T>;
  render: (props) => React.ReactElement;
}
```

**Example:**

```tsx
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/form';
import { Input } from '@/components/ui';

const MyForm = () => {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        name="email"
        control={control}
        label="이메일"
        rules={{ required: '이메일을 입력해주세요' }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            type="email"
            error={fieldState.error?.message}
          />
        )}
      />
    </form>
  );
};
```

---

### PhoneInput

A formatted phone number input component (010-0000-0000).

**Import:**
```tsx
import { PhoneInput } from '@/components/form/PhoneInput';
```

**Props:**
```typescript
interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}
```

**Example:**

```tsx
const [phone, setPhone] = useState('');

<PhoneInput
  label="휴대폰 번호"
  value={phone}
  onChange={setPhone}
  error={error}
/>
```

**Features:**
- Auto-formatting (010-0000-0000)
- Digit-only input
- Real-time validation
- Max 11 digits

---

### OtpInput

A multi-digit OTP input component with auto-focus.

**Import:**
```tsx
import { OtpInput } from '@/components/form/OtpInput';
```

**Props:**
```typescript
interface OtpInputProps {
  length?: number; // default: 6
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}
```

**Example:**

```tsx
const [otp, setOtp] = useState('');

<OtpInput
  length={4}
  value={otp}
  onChange={setOtp}
  error={error}
/>
```

**Features:**
- Auto-focus next input
- Backspace navigation
- Paste support
- Digit-only input

---

## Layout Components

### Container

A centered container with max-width constraints.

**Import:**
```tsx
import { Container } from '@/components/layout/Container';
```

**Props:**
```typescript
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}
```

**Example:**

```tsx
<Container maxWidth="lg">
  <h1>페이지 제목</h1>
  <p>내용</p>
</Container>
```

---

### Stack

A vertical layout component with consistent spacing.

**Import:**
```tsx
import { Stack } from '@/components/layout/Stack';
```

**Props:**
```typescript
interface StackProps {
  spacing?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
}
```

**Example:**

```tsx
<Stack spacing={4} align="start">
  <h2>제목</h2>
  <p>단락 1</p>
  <p>단락 2</p>
</Stack>
```

---

### Flex

A flexible box layout component.

**Import:**
```tsx
import { Flex } from '@/components/layout/Flex';
```

**Props:**
```typescript
interface FlexProps {
  direction?: 'row' | 'col';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: number | string;
}
```

**Example:**

```tsx
<Flex justify="between" align="center" gap={4}>
  <div>왼쪽</div>
  <div>오른쪽</div>
</Flex>
```

---

### Grid

A grid layout component.

**Import:**
```tsx
import { Grid } from '@/components/layout/Grid';
```

**Props:**
```typescript
interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: number | string;
}
```

**Example:**

```tsx
<Grid cols={3} gap={4}>
  <Card>카드 1</Card>
  <Card>카드 2</Card>
  <Card>카드 3</Card>
</Grid>
```

---

## State Views

### LoadingView

A loading state component with spinner.

**Import:**
```tsx
import { LoadingView } from '@/components/ui/StateViews';
```

**Props:**
```typescript
interface LoadingViewProps {
  message?: string;
  className?: string;
}
```

**Example:**

```tsx
{isLoading && <LoadingView message="데이터 불러오는 중..." />}
```

---

### ErrorView

An error state component with retry button.

**Import:**
```tsx
import { ErrorView } from '@/components/ui/StateViews';
```

**Props:**
```typescript
interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}
```

**Example:**

```tsx
{error && (
  <ErrorView
    message="데이터를 불러올 수 없습니다."
    onRetry={refetch}
  />
)}
```

---

### EmptyView

An empty state component with optional action button.

**Import:**
```tsx
import { EmptyView } from '@/components/ui/StateViews';
```

**Props:**
```typescript
interface EmptyViewProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
```

**Example:**

```tsx
{data.length === 0 && (
  <EmptyView
    title="스탬프카드가 없습니다"
    description="첫 번째 스탬프카드를 만들어보세요."
    action={{
      label: '스탬프카드 만들기',
      onClick: () => navigate('/create')
    }}
  />
)}
```

---

## Best Practices

### ✅ Do

**Use composition**:
```tsx
// Good
<Card padding="md">
  <Stack spacing={4}>
    <h2>제목</h2>
    <p>내용</p>
    <Button variant="primary">액션</Button>
  </Stack>
</Card>
```

**Use semantic HTML**:
```tsx
// Good
<Button type="submit">제출</Button>

// Bad
<div onClick={handleSubmit}>제출</div>
```

**Use design tokens**:
```tsx
// Good
<div className="text-kkookk-navy">

// Bad
<div className="text-gray-900">
```

**Prefer common components**:
```tsx
// Good
<Button variant="primary">클릭</Button>

// Bad
<button className="bg-kkookk-orange-500 text-white ...">클릭</button>
```

### ❌ Don't

**Don't override component styles unnecessarily**:
```tsx
// Bad
<Button className="bg-red-500">Delete</Button>

// Good
<Button variant="danger">Delete</Button>
```

**Don't forget accessibility**:
```tsx
// Bad
<Button>
  <img src="/icon.svg" />
</Button>

// Good
<Button aria-label="Close">
  <img src="/icon.svg" alt="" />
</Button>
```

**Don't mix component patterns**:
```tsx
// Bad - mixing common components with custom styles
<div>
  <Button variant="primary">Save</Button>
  <button className="bg-gray-900 text-white ...">Cancel</button>
</div>

// Good - consistent usage
<div>
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</div>
```

---

## Migration Guide

### From Custom Components to Common Components

**Before:**
```tsx
<button className="w-full h-14 bg-kkookk-orange-500 text-white font-semibold rounded-2xl">
  제출
</button>
```

**After:**
```tsx
<Button variant="primary" size="md" className="w-full">
  제출
</Button>
```

---

**Before:**
```tsx
<input
  type="text"
  className="w-full h-14 px-4 border border-black/5 rounded-2xl focus:ring-2 focus:ring-kkookk-orange-500/30"
/>
{error && <p className="text-sm text-kkookk-red">{error}</p>}
```

**After:**
```tsx
<Input
  error={error}
/>
```

---

**Before:**
```tsx
<div className="bg-white rounded-2xl shadow-kkookk-md p-6">
  내용
</div>
```

**After:**
```tsx
<Card variant="default" padding="md">
  내용
</Card>
```

---

## Resources

- [Design System Documentation](./design-system.md)
- [KKOOKK Frontend CLAUDE.md](../CLAUDE.md)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

## Changelog

### Version 1.0.0 (2026-01-27)
- Initial component library release
- Button, Input, Card, Badge, Modal components
- PhoneInput, OtpInput, FormField form components
- Container, Stack, Flex, Grid layout components
- LoadingView, ErrorView, EmptyView state components
- Full TypeScript support
- WCAG 2.1 AA accessibility compliance
