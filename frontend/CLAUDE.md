# Claude Guide (Client)

## 1) Stack

- React + TypeScript (Vite)
- Tailwind CSS
- React Router
- TanStack Query (server state)
- Axios (HTTP client)
- React Hook Form + Zod (forms & validation)
- Vitest + React Testing Library (unit tests)

> Skill files live in `.claude/skills/frontend-core/*`, `.claude/skills/frontend-testing/*`, and `.claude/skills/design-system/*`.

## 2) Product contexts (KKOOKK)

Client UI targets 3 modes:

1. **Customer**: Wallet → stamp progress → request issuance (polling) → redeem (OTP + confirm + TTL)
2. **Owner Backoffice**: manage stores, stamp cards, rules, logs, migration requests
3. **Store Terminal**: issuance approval list (polling) + redeem verification support

## 3) Do / Don't

✅ Do

- **Always refer to the `frontend-core` and `design-system` skills in `.claude/skills`**
- Implement **loading / empty / error** states for every page.
- Keep components small: `Page` → `Container` → `Presentational` split.
- Use accessible markup (labels, aria attributes, focus rings).
- Prefer Tailwind utilities; extract repeated patterns into small components.

❌ Don't

- Don't introduce new libraries without explaining why.
- Don't build a global state store unless required.
- Don't do complex animation unless requested.

## 4) Folder structure (recommended)

```
frontend/src/
  app/                # app entry / router
  pages/              # route pages
  features/           # feature modules (wallet, issuance, redeem, ...)
  components/         # reusable UI components
  lib/                # api client, utils
  hooks/
  types/
```

## 5) API integration rules

- All API calls go through `src/lib/api/*`.
- Use TanStack Query for server data.
- Prefer typed DTOs in `src/types/*`.

## 6) Local commands

```bash
pnpm i
pnpm dev
pnpm test
pnpm lint
```

## 7) Prompting guide for Claude

When asking for a page or component, always provide:

- purpose (what user should do)
- data flow (fetch/mutate, success/failure)
- states (loading/empty/error)
- constraints (mobile-first, a11y)
- expected files (page + components split)
