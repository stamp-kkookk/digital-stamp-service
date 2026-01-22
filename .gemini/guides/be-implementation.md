# Gemini 가이드: 백엔드 코드 구현

## Summary
- **Objective**: Use this guide to generate backend code layer by layer, based on an approved API design.
- **Trigger**: When asked to implement a backend feature for which an API design exists.
- **Input**: The approved API design from the `be-api-design` guide.

## 1. 코드 구현 요청 접수 시 확인 사항

백엔드 기능 구현 요청을 받으면, 먼저 `/guides/be-api-design.md`에 따라 작성된 **승인된 API 설계 문서**가 있는지 확인합니다.

## 2. 코드 구현 순서

설계 문서를 기반으로, 다음 순서에 따라 계층별 코드를 체계적으로 생성합니다.

1.  **Entity 클래스**: 도메인 모델을 정의합니다.
2.  **Repository 인터페이스**: 데이터 접근 계층을 정의합니다.
3.  **Service 클래스**: 비즈니스 로직을 구현합니다.
4.  **DTO 클래스**: 요청(Request) 및 응답(Response) 객체를 정의합니다.
5.  **Controller 클래스**: HTTP 엔드포인트를 구현합니다.
6.  **Exception 클래스**: 커스텀 예외 클래스를 정의합니다.

## 3. 계층별 코드 생성 가이드

### 3.1. Entity 클래스
*   `@Entity`, `@Table` 애너테이션을 사용합니다.
*   기본 생성자는 `@NoArgsConstructor(access = AccessLevel.PROTECTED)`로 보호합니다.
*   `@Getter`를 사용하고, setter는 무분별하게 추가하지 않습니다.
*   `@Builder`를 사용하여 객체 생성을 명확하게 합니다.
*   상태를 변경하는 비즈니스 메서드를 엔티티 내에 포함시킬 수 있습니다.

```java
// 예시: StampCard.java
@Entity
@Table(name = "stamp_card")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StampCard extends BaseTimeEntity {
    // ... 필드 ...
    @Builder
    private StampCard(...) { /* ... */ }

    public void activate() { /* ... */ }
}
```

### 3.2. Repository 인터페이스
*   `JpaRepository<Entity, IdType>`를 상속받습니다.
*   필요한 쿼리 메서드를 선언합니다. (예: `findByStoreId`)

```java
// 예시: StampCardRepository.java
public interface StampCardRepository extends JpaRepository<StampCard, Long> {
    List<StampCard> findByStoreId(Long storeId);
}
```

### 3.3. Service 클래스
*   `@Service`, `@RequiredArgsConstructor`를 사용합니다.
*   클래스 레벨에 `@Transactional(readOnly = true)`를 선언하여 기본적으로 읽기 전용 트랜잭션을 적용합니다.
*   쓰기 작업이 필요한 메서드에만 `@Transactional`을 개별적으로 적용합니다.

```java
// 예시: StampCardService.java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StampCardService {
    private final StampCardRepository stampCardRepository;

    @Transactional
    public StampCardResponse create(Long storeId, CreateStampCardRequest request) {
        // ... 구현 ...
    }
}
```

### 3.4. Controller 클래스
*   `@RestController`, `@RequiredArgsConstructor`를 사용합니다.
*   `@RequestMapping`으로 기본 경로를 지정합니다.
*   `@PostMapping`, `@GetMapping` 등으로 HTTP 메서드와 엔드포인트를 매핑합니다.
*   요청 본문에는 `@Valid @RequestBody`를 사용하여 유효성 검사를 적용합니다.

```java
// 예시: StampCardController.java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/stores/{storeId}/stamp-cards")
public class StampCardController {
    private final StampCardService stampCardService;
    // ... 엔드포인트 구현 ...
}
```

### 3.5. DTO 클래스
*   Java 17의 `record`를 사용하여 불변 DTO를 만듭니다.
*   `@NotBlank`, `@Size`, `@Min`, `@Max` 등 Bean Validation 애너테이션을 사용하여 유효성 검사 규칙을 명시합니다.

```java
// 예시: CreateStampCardRequest.java
public record CreateStampCardRequest(
    @NotBlank(message = "카드 이름은 필수입니다")
    String name,
    @Min(1) @Max(20) int maxStamps
) {}
```

### 3.6. Exception 클래스
*   `BusinessException` (또는 프로젝트의 공통 예외)을 상속받습니다.
*   에러 코드를 사용하여 예외를 생성합니다.

```java
// 예시: StampCardNotFoundException.java
public class StampCardNotFoundException extends BusinessException {
    public StampCardNotFoundException() {
        super(ErrorCode.STAMP_CARD_NOT_FOUND);
    }
}
```

## 4. 코드 구현 후 다음 단계

코드 구현이 완료되면 `/guides/be-test-generation.md` 가이드에 따라 테스트 코드를 작성할 것을 제안합니다.
