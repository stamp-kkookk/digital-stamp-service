# KKOOKK Frontend

> 디지털 스탬프/리워드 SaaS 플랫폼 - 고객/사장님/터미널 웹 애플리케이션

**Version**: 1.0.0
**Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS

---

## 📚 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Component Library](#component-library)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.15.1
- npm >= 10.7.0

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # App entry & router
│   ├── components/
│   │   ├── ui/                 # UI components (Button, Input, Card, etc.)
│   │   ├── form/               # Form components (PhoneInput, OtpInput, etc.)
│   │   ├── layout/             # Layout components (Container, Stack, etc.)
│   │   └── common/             # Legacy common components
│   ├── pages/
│   │   ├── customer/           # Customer pages
│   │   ├── owner/              # Owner/Backoffice pages
│   │   └── terminal/           # Terminal pages
│   ├── features/               # Feature modules
│   ├── lib/
│   │   ├── api/                # API client
│   │   ├── utils/              # Utility functions
│   │   └── validation/         # Zod validation schemas
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types
│   └── index.css               # Global styles & design tokens
├── docs/
│   ├── design-system.md        # Design system documentation
│   └── component-library.md    # Component library documentation
├── public/                     # Static assets
└── CLAUDE.md                   # Claude AI project guide
```

---

## 🎨 Design System

KKOOKK uses a custom design system built with Tailwind CSS. All design tokens are defined in `src/index.css`.

### Quick Reference

**Colors:**
- Primary: `kkookk-orange-*` (Brand color)
- Secondary: `kkookk-indigo-*` (Owner persona)
- Neutral: `kkookk-navy-*`, `kkookk-steel-*`
- Status: `kkookk-green-*`, `kkookk-red-*`, `kkookk-amber-*`

**Spacing:**
- Use `kkookk-xs` (4px) to `kkookk-2xl` (48px)
- Or standard Tailwind spacing (`p-4`, `gap-6`, etc.)

**Border Radius:**
- Buttons/Cards: `rounded-2xl` (16px)
- Inputs: `rounded-2xl` (16px)
- Badges: `rounded-full`

**Typography:**
- Font: Pretendard Variable
- Sizes: `text-kkookk-xs` (12px) to `text-kkookk-3xl` (30px)

📖 **Full documentation**: [docs/design-system.md](./docs/design-system.md)

---

## 🧩 Component Library

We provide a comprehensive component library built on the KKOOKK design system.

### Core Components

**UI Components:**
- `<Button>` - Primary, secondary, outline, ghost, danger variants
- `<Input>` - Text input with label, error, and helper text
- `<Card>` - Container with elevation variants
- `<Badge>` - Status indicators
- `<Modal>` - Accessible modal dialog

**Form Components:**
- `<FormField>` - react-hook-form Controller wrapper
- `<PhoneInput>` - Auto-formatted phone input (010-0000-0000)
- `<OtpInput>` - Multi-digit OTP input with auto-focus

**Layout Components:**
- `<Container>` - Centered container with max-width
- `<Stack>` - Vertical layout with spacing
- `<Flex>` - Flexible box layout
- `<Grid>` - Grid layout

**State Views:**
- `<LoadingView>` - Loading state with spinner
- `<ErrorView>` - Error state with retry button
- `<EmptyView>` - Empty state with action

### Usage Example

```tsx
import { Button, Input, Card } from '@/components/ui';
import { PhoneInput } from '@/components/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneInputSchema } from '@/lib/validation/customer';

function MyForm() {
  const { handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(phoneInputSchema),
  });

  const phone = watch('phone');

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PhoneInput
          label="휴대폰 번호"
          value={phone}
          onChange={(val) => setValue('phone', val)}
          error={errors.phone?.message}
        />
        <Button type="submit" variant="primary" className="w-full">
          제출
        </Button>
      </form>
    </Card>
  );
}
```

📖 **Full documentation**: [docs/component-library.md](./docs/component-library.md)

---

## 🛠 Development

### Code Style

- **ESLint**: Configured with React, TypeScript, and accessibility rules
- **Prettier**: Automatic code formatting with Tailwind plugin
- **Husky**: Pre-commit hooks for linting and formatting

### Validation

We use **Zod** for runtime validation:

```tsx
import { z } from 'zod';

export const phoneSchema = z
  .string()
  .length(11, '전화번호는 11자리여야 합니다')
  .regex(/^010\d{8}$/, '올바른 휴대폰 번호를 입력해주세요');
```

### State Management

- **TanStack Query**: Server state management
- **React Hook Form**: Form state management
- **React Context**: Global UI state (where needed)

### API Integration

All API calls go through `src/lib/api/*`:

```tsx
import { getStoreSummary } from '@/lib/api/store';
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['store', storeId],
  queryFn: () => getStoreSummary(storeId),
});
```

---

## 🧪 Testing

### Unit Tests

```bash
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # Coverage report
```

**Testing tools:**
- **Vitest**: Test runner
- **React Testing Library**: Component testing

### Manual Testing Checklist

Before each release, test:
- [ ] Customer auth flow (phone → OTP → registration)
- [ ] Terminal login and issuance approval
- [ ] Owner store registration wizard
- [ ] Mobile responsiveness
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

---

## 🚀 Deployment

### Build

```bash
npm run build
```

Output directory: `dist/`

### Environment Variables

Create `.env.local` file:

```env
VITE_API_BASE_URL=https://api.example.com
```

### Production Checklist

- [ ] All tests passing
- [ ] ESLint errors resolved
- [ ] Build succeeds
- [ ] Assets optimized
- [ ] Environment variables configured
- [ ] API endpoints updated

---

## 📖 Documentation

- [Design System](./docs/design-system.md) - Colors, typography, spacing
- [Component Library](./docs/component-library.md) - Component usage and examples
- [CLAUDE.md](./CLAUDE.md) - AI agent development guide

---

## 🤝 Contributing

1. Create a feature branch
2. Follow the code style guidelines
3. Write tests for new features
4. Update documentation
5. Submit a pull request

---

## 📝 License

Proprietary - KKOOKK Platform

---

## 🆘 Support

For questions or issues, please contact the development team.
