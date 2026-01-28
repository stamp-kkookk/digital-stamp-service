# Test Creation Prompt

> 테스트 케이스를 생성할 때 사용하는 command입니다.
> 구현된 코드를 검증하는 테스트를 작성합니다.

---

중요: Spring Boot 3.4+ 최신 규격 준수
- **Mock 객체 선언 시 반드시 `@MockitoBean`을 사용합니다.** (기존 `@MockBean` 사용 금지)
- **Spy 객체 선언 시 반드시 `@MockitoSpyBean`을 사용합니다.** (기존 `@SpyBean` 사용 금지)

---

## Input 필수 항목

### 1. 테스트 대상
$ARGUMENTS

### 2. 테스트 범위
(Controller / Service / Repository / 통합 / 전체)

### 3. 구현 코드
(테스트할 클래스 참조)

---

## Output 요구사항

### 1. Controller 테스트 (MockMvc)
```java
@WebMvcTest(StampCardController.class)
class StampCardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StampCardService stampCardService;

    @Test
    @DisplayName("스탬프카드 생성 성공")
    void createStampCard_Success() throws Exception {
        // given
        // when
        // then
    }

    @Test
    @DisplayName("스탬프카드 생성 실패 - 이름 누락")
    void createStampCard_Fail_NameRequired() throws Exception {
        // given
        // when
        // then
    }
}
```

### 2. Service 테스트
```java
@ExtendWith(MockitoExtension.class)
class StampCardServiceTest {

    @InjectMocks
    private StampCardService stampCardService;

    @Mock
    private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("스탬프카드 조회 성공")
    void getStampCard_Success() {
        // given
        // when
        // then
    }

    @Test
    @DisplayName("스탬프카드 조회 실패 - 존재하지 않음")
    void getStampCard_Fail_NotFound() {
        // given
        // when
        // then
    }
}
```

### 3. Repository 테스트
```java
@DataJpaTest
class StampCardRepositoryTest {

    @Autowired
    private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("매장별 스탬프카드 조회")
    void findByStoreId() {
        // given
        // when
        // then
    }
}
```

---

## 테스트 케이스 분류

### 성공 케이스
- 정상 입력 → 정상 출력
- 경계값 테스트 (최소/최대)

### 실패 케이스
- 유효성 검증 실패 (400)
- 인증 실패 (401)
- 권한 없음 (403)
- 리소스 없음 (404)
- 충돌 (409)

### 엣지 케이스
- 빈 목록 조회
- TTL 만료
- 중복 요청
- 동시성 이슈

---

## 사용 예시

```
/be-test StampCard

테스트 범위: 전체
구현 코드: StampCardController, StampCardService, StampCardRepository
```

---

## 테스트 네이밍 규칙

```java
@DisplayName("한글로 테스트 설명")
void methodName_Condition_ExpectedResult() { }
```

예시:
- `createStampCard_Success`
- `createStampCard_Fail_NameRequired`
- `getStampCard_Fail_NotFound`

---

## 필수 테스트 체크리스트

### Controller
- [ ] 성공 응답 (200/201)
- [ ] 유효성 검증 실패 (400)
- [ ] 인증 실패 (401) - 해당 시
- [ ] 리소스 없음 (404)

### Service
- [ ] 정상 로직 수행
- [ ] 예외 발생 케이스
- [ ] 트랜잭션 롤백 케이스

### Repository
- [ ] 기본 CRUD
- [ ] 커스텀 쿼리 메서드

---

## 테스트 도구

- JUnit5 + AssertJ
- Mockito (단위 테스트)
- MockMvc (Controller 테스트)
- @DataJpaTest (Repository 테스트)
- @SpringBootTest (통합 테스트)
