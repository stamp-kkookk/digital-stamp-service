# Gemini 가이드: 백엔드 API 설계 체크리스트

## Summary
- **Objective**: Use this guide to systematically design RESTful backend API interfaces.
- **Trigger**: When asked to design a new backend API, feature, or endpoint.
- **Output Format**: Follow the structured output format specified in Section 3.

## 1. API 설계 요청 접수 시 확인 사항

새로운 백엔드 API 설계 요청을 받으면 다음 정보를 사용자에게 확인하거나 스스로 파악해야 합니다.

1.  **기능명**: 설계할 API의 핵심 기능은 무엇인가요?
2.  **설계 문서 참조 (복잡한 기능인 경우)**: 이전에 `/be-design` 가이드를 통해 로직 설계가 완료되었는지 확인하고, 해당 내용을 참조합니다.
3.  **인증 요구사항**: 이 API를 사용하는 주체는 누구인가요? (고객 `Customer` / 점주 `Owner` / 단말기 `Terminal` / 공개 `Public`)

## 2. API 설계 원칙

Kkookk 백엔드 API 설계 시 다음 원칙을 엄격히 준수합니다.

### 2.1. RESTful 네이밍 컨벤션
*   **리소스**: URL 경로에 명사를 사용하며, 컬렉션은 복수형(`/{resource}s`)을 사용합니다. (예: `/api/stamp-cards`)
*   **행위**: 리소스에 대한 행위는 HTTP 메서드(GET, POST, PUT, DELETE 등)로 표현합니다.

### 2.2. 경로 구조
*   `/api/owner/...` : 점주 전용 API
*   `/api/customer/...` : 고객 전용 API
*   `/api/terminal/...` : 상점 단말기 전용 API

### 2.3. 멱등성 (Idempotency)
*   **멱등**: GET, PUT, DELETE 메서드는 멱등해야 합니다. (동일 요청 반복 시 결과 동일)
*   **비멱등**: POST 메서드는 기본적으로 비멱등입니다. 필요시 `idempotency key`를 활용하여 멱등성을 보장해야 합니다.

### 2.4. 페이징 (목록 조회 API)
*   목록을 조회하는 API는 `?page={pageNumber}&size={pageSize}&sort={field},{direction}` 형식의 페이징 파라미터를 지원해야 합니다.
    *   예: `GET /api/stamp-cards?page=0&size=20&sort=createdAt,desc`

## 3. API 설계 제안 시 출력 형식 (반드시 준수)

API 설계를 사용자에게 제안할 때는 다음 구조로 상세 내용을 제공해야 합니다.

### 3.1. Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `HTTP 메서드` | `API 경로` | `인증 주체` | `API 설명` |
| GET | `/api/owners/{storeId}/stamp-cards` | Owner | 특정 매장의 스탬프 카드 목록 조회 |
| POST | `/api/owners/{storeId}/stamp-cards` | Owner | 새로운 스탬프 카드 생성 |

### 3.2. Request/Response DTOs
관련 DTO 클래스의 구조와 주요 필드를 자바(Java) 코드 형식으로 표현합니다.

```java
// Request 예시
public record CreateStampCardRequest(
    @NotBlank String name,
    @Min(1) @Max(20) int maxStamps
) {}

// Response 예시
public record StampCardResponse(
    Long id,
    String name,
    int maxStamps,
    StampCardStatus status
) {}
```

### 3.3. Status Codes
API 응답에 사용될 HTTP 상태 코드와 그 조건을 명시합니다.

| Code | Condition |
|------|-----------|
| 200 | 요청 성공 (GET, PUT, DELETE) |
| 201 | 리소스 생성 성공 (POST) |
| 400 | 유효성 검증 실패 또는 잘못된 요청 |
| 401 | 인증 필요 (로그인되지 않은 사용자) |
| 403 | 권한 없음 (접근이 허용되지 않은 리소스) |
| 404 | 리소스를 찾을 수 없음 |
| 409 | 리소스 충돌 (예: 중복된 값) |

### 3.4. Error Response Format
API의 에러 응답은 일관된 JSON 형식으로 제공되어야 합니다.

```json
{
  "code": "ERROR_CODE",
  "message": "사용자에게 보여줄 에러 메시지",
  "timestamp": "yyyy-MM-dd'T'HH:mm:ssZ"
}
```

### 3.5. DB Model
관련 데이터베이스 테이블의 스키마와 주요 컬럼을 제시합니다. 필요한 경우 인덱스도 명시합니다.

```
table_name
├── id (PK)
├── fk_id (FK, INDEX)
├── column_name
├── status (ENUM)
├── created_at
└── updated_at
```

### 3.6. Validation Rules
요청 DTO에 적용될 구체적인 유효성 검사 규칙을 설명합니다.
*   `name`: 필수, 2자 이상 50자 이하
*   `maxStamps`: 필수, 1 이상 20 이하

### 3.7. Implementation Order
구현을 위한 권장 순서를 제시합니다.
1.  Entity 클래스 정의
2.  Repository 인터페이스 정의
3.  Service 클래스 구현
4.  Controller 클래스 구현
5.  DTO 클래스 정의
6.  Exception 클래스 정의

## 4. API 설계 후 다음 단계 (내부 지시)

API 설계 제안이 사용자에게 승인되면, 다음 지시사항을 따릅니다.

1.  **설계 리뷰**: `/be-review` 가이드를 참조하여 설계 리뷰 단계를 거칠 것을 제안합니다.
2.  **구현**: `/be-impl` 가이드를 참조하여 실제 구현을 진행합니다.
```
