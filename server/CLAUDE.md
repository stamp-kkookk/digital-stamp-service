# Claude Guide (Server)

## 1) Stack

* Java 17
* Spring Boot 3.x
* Spring Web
* Spring Validation
* Spring Data JPA
* MySQL
* Spring Security (owner/admin auth)
* Lombok (limited usage)
* **Swagger (OpenAPI 3) via springdoc-openapi**
* JUnit5 + Spring Boot Test

> Rule files live in `.claude/rules/backend/*`.

✅ Recommended dependency (Spring Boot 3.x)

```gradle
implementation "org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0"
```

---

## 2) Product contexts (KKOOKK)

Core flows (MVP):

* **Issuance**: Customer creates `IssuanceRequest` (TTL, idempotent) → Store Terminal approves/rejects → Customer polls and sees completion.
* **Redeem**: Customer clicks [Use] → **OTP step-up required** → create `RedeemSession` (short TTL) → store confirms on customer device → mark completed.
* **Migration**: Customer uploads paper stamp image → owner approves with manual count → stamp count increased + event logged.

---

## 3) Architecture rules

* Layered structure:

  * Controller: request/response mapping, validation, status codes
  * Service: business rules, transactions
  * Repository: JPA queries
* Prefer **feature-by-feature packages** (not huge global util classes).
* Keep MVP simple: no microservices, no event bus unless requested.

---

## 4) Naming & code style

Follow team conventions:

* Google Java Style base (indent 4 spaces, max line 120)
* Limit nesting depth to ~2 (use early returns)
* Avoid unclear names like `Info`, `Data`, `Util`
* JPA entity IDs are `Long`

---

## 5) API design guardrails

* Always output **API list → DTOs → DB tables → errors → implementation steps → tests** before writing code.
* Use consistent error responses and `@RestControllerAdvice`.
* Use `@Valid` and Bean Validation on request DTOs.
* Swagger/OpenAPI rules:

  * Add `@Tag(name = "...")` per controller group
  * Document endpoints using `@Operation(summary = "...", description = "...")`
  * For request/response examples: use `@Schema(example = "...")` on DTO fields
  * If auth is required: mark with `@SecurityRequirement(name = "bearerAuth")`

✅ Swagger UI location (default):

* `/swagger-ui/index.html`
* `/v3/api-docs`

---

## 6) Testing

* At least:

  * 1 success + 1 failure test per endpoint
  * Repository tests only when custom queries exist
* Swagger is generated from code annotations + OpenAPI runtime scanning
  → **테스트에서 snippet 생성은 하지 않는다**
  → 대신 **MockMvc 테스트는 “정상/실패 케이스 + 에러 응답 형식 보장”** 중심으로 검증한다.

---

## 7) Local commands

```bash
./gradlew test
./gradlew bootRun
```

See `.claude/commands/be-api-design.md` and `.claude/commands/be-controller-service.md`.

