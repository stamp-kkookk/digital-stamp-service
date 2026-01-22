# Gemini 가이드: 백엔드 테스트 코드 생성

## Summary
- **Objective**: Use this guide to generate structured and comprehensive test code for backend services.
- **Trigger**: When asked to write tests for a backend feature.
- **Input**: The implemented code to be tested.

## 1. 테스트 코드 생성 요청 접수 시 확인 사항

백엔드 테스트 코드 생성 요청을 받으면, 다음 정보를 확인합니다.

1.  **테스트 대상**: 어떤 기능 또는 클래스에 대한 테스트를 작성해야 하나요?
2.  **테스트 범위**: 테스트할 범위를 지정합니다. (`Controller` / `Service` / `Repository` / `통합` / `전체`)
3.  **구현 코드**: 테스트할 소스 코드를 참조합니다.

## 2. 테스트 케이스 분류

다음과 같은 케이스들을 고려하여 테스트를 작성합니다.

### 2.1. 성공 케이스
*   정상적인 입력값에 대해 기대하는 결과가 나오는지 확인합니다.
*   경계값(최소/최대 등)에 대한 동작을 테스트합니다.

### 2.2. 실패 케이스
*   **유효성 검증 실패 (400)**: 잘못된 입력값에 대해 `400 Bad Request`가 발생하는지 확인합니다.
*   **인증 실패 (401)**: 인증되지 않은 사용자의 접근을 차단하는지 확인합니다.
*   **권한 없음 (403)**: 권한 없는 사용자의 접근을 차단하는지 확인합니다.
*   **리소스 없음 (404)**: 존재하지 않는 리소스 조회 시 `404 Not Found`가 발생하는지 확인합니다.
*   **충돌 (409)**: 리소스 충돌 시 `409 Conflict`가 발생하는지 확인합니다.

### 2.3. 엣지 케이스
*   빈 목록 조회, TTL 만료, 중복 요청, 동시성 이슈 등 특수한 상황을 테스트합니다.

## 3. 계층별 테스트 코드 생성 가이드

### 3.1. Controller 테스트 (MockMvc)
*   `@WebMvcTest`를 사용하여 특정 컨트롤러만 테스트합니다.
*   의존하는 서비스는 `@MockBean`으로 Mock 객체를 만듭니다.
*   `MockMvc`를 사용하여 HTTP 요청을 시뮬레이션하고, 응답 상태 코드, 헤더, 본문을 검증합니다.

```java
// 예시: StampCardControllerTest.java
@WebMvcTest(StampCardController.class)
class StampCardControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private StampCardService stampCardService;

    @Test
    @DisplayName("스탬프카드 생성 성공")
    void createStampCard_Success() throws Exception {
        // given: stampCardService.create()가 특정 값을 반환하도록 설정
        // when/then: mockMvc.perform(post(...))으로 API를 호출하고, andExpect(...)로 결과를 검증
    }
}
```

### 3.2. Service 테스트 (Mockito)
*   `@ExtendWith(MockitoExtension.class)`를 사용하여 Mockito를 활성화합니다.
*   테스트 대상 서비스는 `@InjectMocks`로, 의존하는 리포지토리는 `@Mock`으로 Mock 객체를 만듭니다.
*   `given-when-then` 패턴을 사용하여 비즈니스 로직을 검증합니다.

```java
// 예시: StampCardServiceTest.java
@ExtendWith(MockitoExtension.class)
class StampCardServiceTest {
    @InjectMocks private StampCardService stampCardService;
    @Mock private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("스탬프카드 조회 성공")
    void getStampCard_Success() {
        // given: repository.findById()가 Optional<StampCard>를 반환하도록 설정
        // when: stampCardService.getStampCard() 호출
        // then: 반환된 결과가 기대값과 일치하는지 AssertJ로 검증
    }
}
```

### 3.3. Repository 테스트 (`@DataJpaTest`)
*   `@DataJpaTest`를 사용하여 JPA 관련 컴포넌트만 테스트합니다. (인메모리 DB 사용)
*   `@Autowired`로 테스트할 리포지토리를 주입받습니다.
*   커스텀 쿼리 메서드의 동작을 검증합니다.

```java
// 예시: StampCardRepositoryTest.java
@DataJpaTest
class StampCardRepositoryTest {
    @Autowired private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("매장별 스탬프카드 조회")
    void findByStoreId() {
        // given: 테스트 데이터를 저장
        // when: repository.findByStoreId() 호출
        // then: 조회된 결과가 기대값과 일치하는지 검증
    }
}
```

## 4. 테스트 네이밍 규칙

*   `@DisplayName` 애너테이션을 사용하여 테스트 목적을 한글로 명확하게 설명합니다.
*   메서드 이름은 `methodName_Condition_ExpectedResult()` 형식을 따릅니다.
    *   예시: `createStampCard_Success`, `getStampCard_Fail_NotFound`

## 5. 필수 테스트 도구

*   **Assertion Library**: AssertJ
*   **Mocking Framework**: Mockito
*   **테스트 실행**: JUnit5
*   **Controller 테스트**: MockMvc
*   **Repository 테스트**: `@DataJpaTest`
*   **통합 테스트**: `@SpringBootTest`
