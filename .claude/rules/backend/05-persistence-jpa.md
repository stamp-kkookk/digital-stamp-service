# Persistence (JPA + MySQL)

## General

- Use JPA entities for aggregates.
- Use `@Transactional` on service layer.
- Read-only queries: `@Transactional(readOnly = true)`.

## Index hint

- Index wallet/store IDs for fast lookups.

## Idempotency

- Prefer unique constraints (e.g., one active session per reward) to enforce one-time completion.
