# Backend Testing

## Default

- JUnit5 + Spring Boot Test
- MockMvc for controller tests

## Minimum requirements

- Each endpoint: at least 1 success + 1 failure test
- Document important endpoints with Spring REST Docs

## What to test

- validation errors
- authorization errors (if applicable)
- idempotency & TTL expiry behaviors
