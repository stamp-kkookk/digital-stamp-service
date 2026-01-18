# API Interface Design Prompt

> API 인터페이스를 설계할 때 사용하는 command입니다.
> 복잡한 기능은 `/be-design`으로 로직 설계 후 실행합니다.

---

## Input 필수 항목

### 1. 기능명
$ARGUMENTS

### 2. 설계 문서 (복잡한 기능인 경우)
(`/be-design` 출력 결과 참조)

### 3. 인증 요구사항
(Customer / Owner / Terminal / Public)

---

## Output 요구사항

### 1. Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/... | Owner | 목록 조회 |
| POST | /api/... | Owner | 생성 |

### 2. Request/Response DTOs

```java
// Request
public record CreateStampCardRequest(
    @NotBlank String name,
    @Min(1) @Max(20) int maxStamps
) {}

// Response
public record StampCardResponse(
    Long id,
    String name,
    int maxStamps,
    StampCardStatus status
) {}
```

### 3. Status Codes
| Code | Condition |
|------|-----------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 유효성 검증 실패 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복 등) |

### 4. Error Response Format
```json
{
  "code": "STAMP_CARD_NOT_FOUND",
  "message": "스탬프카드를 찾을 수 없습니다",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 5. DB Model

```
stamp_card
├── id (PK)
├── store_id (FK, INDEX)
├── name
├── max_stamps
├── status (ENUM)
├── created_at
└── updated_at
```

### 6. Validation Rules
- name: 필수, 2~50자
- maxStamps: 필수, 1~20

### 7. Implementation Order
1. Entity 클래스
2. Repository 인터페이스
3. Service 클래스
4. Controller 클래스
5. DTO 클래스
6. Exception 클래스

---

## 사용 예시

### 단순 CRUD
```
/be-api StampCard CRUD

인증: Owner (점주 전용)
```

### 복잡한 기능 (설계 참조)
```
/be-api 스탬프 발급

설계 문서: /be-design 출력 결과 참조
인증: Customer (요청), Terminal (승인)
```

---

## API 설계 원칙

1. **RESTful 네이밍**
   - 복수형 명사 사용 (`/stamp-cards`)
   - 행위는 HTTP 메서드로 표현

2. **경로 구조**
   - `/api/owner/...` - 점주 전용
   - `/api/customer/...` - 고객 전용
   - `/api/terminal/...` - 터미널 전용

3. **멱등성**
   - GET, PUT, DELETE는 멱등
   - POST는 비멱등 (필요시 idempotency key)

4. **페이징** (목록 API)
   - `?page=0&size=20&sort=createdAt,desc`

---

## 다음 단계

API 설계 완료 후:
1. `/be-review` → 설계 리뷰
2. `/be-impl` → 구현
