# Gemini Backend Testing Directives: Kkookk Project

## Summary
- **Objective**: Implement and review comprehensive backend tests for Spring Boot applications using JUnit5, MockMvc, and Spring Boot Test.
- **Scope**: Controller tests, Service tests, Integration tests.
- **Key Principles**: High coverage, clear naming, focus on critical scenarios.

## 1. 이 스킬 사용 시점

Kkookk 프로젝트 백엔드 개발 중 다음 작업을 수행할 때 이 지시사항을 준수합니다:
*   서비스나 리포지토리에 대한 단위 테스트를 작성할 때
*   MockMvc를 사용하여 컨트롤러 테스트를 작성할 때
*   통합 테스트를 작성할 때
*   테스트 커버리지 또는 테스트 품질을 검토할 때

## 2. 테스트 스택

*   **프레임워크**: JUnit5 + Spring Boot Test
*   **컨트롤러 테스트**: MockMvc
*   **통합 테스트 (선택 사항)**: Testcontainers

## 3. 최소 테스트 요구 사항

*   **각 엔드포인트**: 최소한 1개의 성공 테스트 케이스와 1개의 실패 테스트 케이스를 포함해야 합니다.
*   **문서화**: 중요한 엔드포인트는 Spring REST Docs를 사용하여 문서화하는 것을 고려합니다.

<h2>4. 반드시 테스트할 시나리오</h2>

다음과 같은 주요 시나리오에 대해 테스트 케이스를 작성합니다.

1.  **유효성 검사 오류 (Validation errors)**: 잘못된 입력 값 처리.
2.  **인가 오류 (Authorization errors)**: (해당하는 경우) 권한 없는 접근 처리.
3.  **멱등성 동작 (Idempotency behaviors)**: 중복 요청 처리.
4.  **TTL 만료 동작 (TTL expiry behaviors)**: 세션/토큰 만료 처리.

<h2>5. 테스트 코드 조직화</h2>

테스트 코드는 `src/test/java/` 디렉토리 아래에 다음 구조를 따릅니다.

```
src/test/java/
├── controller/
│   └── {Feature}ControllerTest.java  # 컨트롤러 테스트
├── service/
│   └── {Feature}ServiceTest.java     # 서비스 단위 테스트
└── integration/
    └── {Feature}IntegrationTest.java # 통합 테스트
```

<h2>6. 테스트 네이밍 컨벤션</h2>

테스트 메서드 이름은 다음 컨벤션을 따릅니다.

```java
@Test
void should_ReturnSuccess_When_ValidInput() { } // 유효한 입력 시 성공을 반환해야 함

@Test
void should_ThrowException_When_InvalidInput() { } // 유효하지 않은 입력 시 예외를 발생시켜야 함
```

---

