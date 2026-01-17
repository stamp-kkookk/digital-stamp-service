# Frontend Code Convention (React & TypeScript)

## 1. Code Style

- Basically follows the **Airbnb JavaScript Style Guide**, with the following exceptions:
- **Indentation:** Use **4 spaces** (to stay consistent with the backend convention).
- **Line Limit:** Restricted to **120 characters**.
- **Semicolon:** Do **not** use semicolons (**false**).

## 2. Naming Conventions

- **Components & Files:** Use `PascalCase`.
- e.g., `UserProfile.tsx`, `HeaderContainer.tsx`

- **Variables / Functions / Hooks:** Use `camelCase`.
- e.g., `const [isOpen, setIsOpen] = useState(false);`

- **Constants:** Use `SCREAMING_SNAKE_CASE`.
- e.g., `const MAX_RETRY_COUNT = 3;`

- **No Abbreviations:** Avoid shortening names. Priority is given to clarity over brevity.

```typescript
// bad
const idx = 0;
const LatLng = { lat, lng };

// good
const index = 0;
const LatitudeLongitude = { latitude, longitude };
```

- **Boolean Naming:**
- Use prefixes like `is`, `has`, `can`, `should`.
- Use `handle` prefix for event handler functions and `on` prefix for handler props.

```typescript
// bad
const open = () => {};
<Button click={open} />

// good
const handleOpen = () => {};
<Button onClick={handleOpen} />

```

## 3. React Components

- **Functional Components:** Always use `arrow functions`.
- **Prop Destructuring:** Destructure props directly in the component argument.

```tsx
// bad
const UserCard = (props) => {
  return <div>{props.name}</div>;
};

// good
const UserCard = ({ name, age }: UserCardProps) => {
  return <div>{name}</div>;
};
```

- **Declaration Order inside Components:**

1. State declarations (`useState`)
2. Memoization (`useMemo`, `useCallback`)
3. Side effects (`useEffect`)
4. Event handlers
5. JSX Rendering

## 4. TypeScript Rules

- **Strict Typing:** Never use `any`. Use `unknown` if the type is truly uncertain.
- **Interface vs. Type:**
- Use `interface` for defining object structures (Props, API Responses).
- Use `type` for Unions or simple aliases.

- **Avoid Enums:** Use `as const` objects or `Union Types` instead of TypeScript Enums.

```typescript
// good
const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];
```

## 5. Tailwind CSS Rules

- **Class Order:** Layout (position, display) -> Box Model (spacing, size) -> Typography -> Background/Border -> Others.
- Use `prettier-plugin-tailwindcss` for automatic sorting.

- **Conditional Classes:** Manage using `clsx` or `tailwind-merge`.

```tsx
// good
<div className={twMerge(
    "flex items-center justify-center p-4 text-white",
    isActive ? "bg-blue-500" : "bg-gray-500"
)}>

```

## 6. Import Rules

- **Absolute Paths:** Use `@/` prefix for major directories (`components/`, `hooks/`, etc.).
- **Import Sorting Order:**

1. React core libraries
2. Third-party libraries
3. Global/Common components
4. Domain-specific components
5. Hooks, Utils, Types
6. Assets (images, css)

## 7. Control Flow & Depth

- **Braces Required:** Do not omit `{}` even for single-line `if` statements.
- **Depth Limit:** Maintain a depth of **1 or less** whenever possible (Max 2).
- Actively use **Early Returns**.

## 8. Linting & Formatting

- **Tools:**
- **ESLint:** Code quality, accessibility(a11y), and import sorting.
- **Prettier:** Code formatting and Tailwind class sorting.
- **Husky & lint-staged:** Automated verification before `git commit`.

- **Prettier Config:**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 4,
  "trailingComma": "es5",
  "printWidth": 120,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```
