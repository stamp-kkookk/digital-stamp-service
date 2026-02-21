# Implementation Prompt

> 설계 기반으로 코드를 구현할 때 사용하는 command입니다.
> `/be-api` 출력 결과를 기반으로 레이어별 코드를 생성합니다.

---

## Input 필수 항목

### 1. 구현 대상
$ARGUMENTS

### 2. 설계 문서
(이전 `/be-api` 출력 결과)

### 3. 구현 범위
(Entity / Repository / Service / Controller / 전체)

---

## Output 요구사항

### 1. Entity 클래스
```java
@Entity
@Table(name = "stamp_card")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StampCard extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 필드...

    @Builder
    private StampCard(...) { }

    // 비즈니스 메서드
    public void activate() { }
}
```

### 2. Repository 인터페이스
```java
public interface StampCardRepository extends JpaRepository<StampCard, Long> {

    List<StampCard> findByStoreId(Long storeId);

    Optional<StampCard> findByIdAndStoreId(Long id, Long storeId);
}
```

### 3. Service 클래스
```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StampCardService {

    private final StampCardRepository stampCardRepository;

    @Transactional
    public StampCardResponse create(Long storeId, CreateStampCardRequest request) {
        // 구현
    }
}
```

### 4. Controller 클래스
```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/stores/{storeId}/stamp-cards")
public class StampCardController {

    private final StampCardService stampCardService;

    @PostMapping
    public ResponseEntity<StampCardResponse> create(
            @PathVariable Long storeId,
            @Valid @RequestBody CreateStampCardRequest request) {
        // 구현
    }
}
```

### 5. DTO 클래스
```java
public record CreateStampCardRequest(
    @NotBlank(message = "카드 이름은 필수입니다")
    @Size(min = 2, max = 50)
    String name,

    @Min(1) @Max(20)
    int maxStamps
) {}
```

### 6. Exception 클래스
```java
public class StampCardNotFoundException extends BusinessException {
    public StampCardNotFoundException() {
        super(ErrorCode.STAMP_CARD_NOT_FOUND);
    }
}
```

---

## 사용 예시

### 전체 구현
```
/be-impl StampCard CRUD

설계 문서: (이전 /be-api 출력)
구현 범위: 전체
```

### 부분 구현
```
/be-impl StampCard Service

설계 문서: (이전 /be-api 출력)
구현 범위: Service
```

---

## 구현 순서

```
1. Entity → 도메인 모델 정의
       ↓
2. Repository → 데이터 접근 계층
       ↓
3. Service → 비즈니스 로직
       ↓
4. DTO → 요청/응답 객체
       ↓
5. Controller → HTTP 엔드포인트
       ↓
6. Exception → 예외 클래스
```

---

## 코드 스타일 규칙

- 들여쓰기: 4 spaces
- 최대 줄 길이: 120자
- Lombok: `@Getter`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`
- Entity: `@NoArgsConstructor(access = PROTECTED)`
- boolean 필드: `is` prefix 없이 (예: `private boolean active;`)

---

## 다음 단계

구현 완료 후:
1. `/be-test` → 테스트 작성
