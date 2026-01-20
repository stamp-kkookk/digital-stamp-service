# Frontend Testing Skill

> Load when writing or reviewing frontend tests

---

## Stack

- Vitest + React Testing Library
- Prefer testing **user behavior** over implementation details

---

## Minimum Requirements

Each important page/component:
- 1 happy path render test
- 1 error/empty state test (where relevant)

---

## Testing Priority

1. **Critical flows** (redeem, issuance)
2. **Form submissions**
3. **Loading/error states**
4. **User interactions**

---

## Test File Location

```
src/features/{feature}/__tests__/
├── {Component}.test.tsx
└── {Container}.test.tsx
```

---

## Testing Patterns

### Render Test
```tsx
import { render, screen } from '@testing-library/react'
import { UserProfile } from '../UserProfile'

describe('UserProfile', () => {
    it('renders user name', () => {
        render(<UserProfile name="John" />)
        expect(screen.getByText('John')).toBeInTheDocument()
    })
})
```

### User Interaction Test
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('calls onSubmit when form is submitted', async () => {
    const handleSubmit = vi.fn()
    render(<LoginForm onSubmit={handleSubmit} />)

    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(handleSubmit).toHaveBeenCalled()
})
```
