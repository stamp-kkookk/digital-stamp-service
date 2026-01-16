# Frontend Code Style

- Prefer functional components + hooks.
- Keep one component per file unless tiny subcomponents.
- Extract UI-only components from logic-heavy containers.

## State branching

Every page must handle:
- loading
- empty
- error

## Error handling

- Show user-friendly message
- Provide a recovery action (retry / back)
