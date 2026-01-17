# API Design Output Format (Required)

Before implementing an API, always output this structure:

1) **Endpoints**
- method + path
- auth
- status codes

2) **Req/Res DTOs**

3) **DB model**
- tables + main columns
- indexes (only if needed)

4) **Validation & exceptions**

5) **Implementation steps**
- Controller → Service → Repository

6) **Test cases**
- success
- failure

7) **API Design Checklist (MVP)**

 - Swagger/OpenAPI disabled (MVP)
-  API contracts documented (DTO + status codes + error format)

## MVP constraints

- Prefer polling over websockets
- Keep TTL & idempotency explicit in spec
