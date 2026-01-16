# React Components

## Composition pattern

- `Page` (route-level)
  - `Container` (data fetch + state)
    - `View` (presentational)

## Props & types

- Prefer explicit prop interfaces.
- Avoid `any`.

## Reusability

- Common UI elements go into `src/components/`.
- Feature-specific UI stays under `src/features/<feature>/components/`.
