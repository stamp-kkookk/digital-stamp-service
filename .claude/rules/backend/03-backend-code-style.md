# Backend Code Style (Team)

Base: Google Java Style, with these overrides:
- indentation: 4 spaces
- max line length: 120

## Naming

- Use camelCase for variables/methods/classes.
- Avoid unclear names: `Data`, `Info`, `Item`, `Util`, `Common`.
- Avoid abbreviations if possible.

### boolean naming

- Local boolean variables: prefix with `is...` (e.g., `boolean isValid`)
- Entity boolean fields: **no** `is` prefix (Lombok getter issue). Example: `private boolean active;`

### Find vs Get

- `find*`: may not exist → return Optional / empty list
- `get*`: must exist → throw exception when missing

## Lombok allowed

- `@Getter`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`
- JPA Entity: `@NoArgsConstructor(access = PROTECTED)`

## Imports

- No wildcard imports
- Avoid static imports in production (tests can use assert static imports)

## Braces

Never omit braces (`{}`), even for single-line if.

## Complexity guardrails

- Keep nesting depth around 2
- Prefer early returns and method extraction
