# Gemini Backend Development Directives: Kkookk API

## 1. 기술 스택 및 환경

Kkookk 백엔드 API 개발 시 다음 기술 스택과 환경을 준수합니다.

*   **Java**: 17
*   **프레임워크**: Spring Boot 3.x (Spring Web, Spring Validation, Spring Data JPA, Spring Security)
*   **데이터베이스**: MySQL
*   **빌드 도구**: Gradle
*   **문서화**: Swagger (OpenAPI 3) via springdoc-openapi
*   **테스트**: JUnit5 + Spring Boot Test

### Swagger 설정
`springdoc-openapi-starter-webmvc-ui:2.5.0` 의존성을 사용하며, Swagger UI는 `/swagger-ui/index.html`에서, OpenAPI 정의는 `/v3/api-docs`에서 접근 가능합니다.

## 2. 핵심 비즈니스 흐름 (컨텍스트)

다음 핵심 비즈니스 흐름을 이해하고 개발에 반영합니다.

*   **스탬프 발급 (Issuance)**: 고객의 `IssuanceRequest`에 대해 점주 터미널에서 승인/거절하며, 고객은 상태를 폴링하여 완료를 확인합니다.
*   **보상 사용 (Redeem)**: 고객이 '사용' 클릭 시 **OTP 인증**이 필수이며, 단기 TTL의 `RedeemSession`이 생성됩니다. 점주의 확인 후 완료 처리됩니다.
*   **마이그레이션 (Migration)**: 고객이 종이 스탬프 이미지를 업로드하면, 점주가 수동으로 확인 및 승인하여 스탬프 수가 증가하고 이벤트가 기록됩니다.

## 3. 아키텍처 및 설계 원칙

*   **계층형 구조**:
    *   **Controller**: 요청/응답 매핑, 유효성 검사, HTTP 상태 코드 처리.
    *   **Service**: 비즈니스 로직, 트랜잭션 관리.
    *   **Repository**: JPA 쿼리 및 데이터 접근.
*   **패키지 구조**: 거대한 전역 유틸리티 클래스 대신, **기능별 패키지**(`feature-by-feature packages`)를 선호합니다.
*   **MVP 유지**: 마이크로서비스나 이벤트 버스 등 복잡한 아키텍처는 명시적인 요청 없이는 도입하지 않고, MVP(Minimum Viable Product)를 단순하게 유지합니다.

## 4. 네이밍 및 코드 스타일

*   **Java 스타일**: Google Java Style Guide를 기본으로 따릅니다 (들여쓰기 4칸, 최대 라인 길이 120자).
*   **중첩 깊이**: 코드의 중첩 깊이는 2단계 이내로 유지하며, `early return`을 적극 활용합니다.
*   **명확한 이름**: `Info`, `Data`, `Util`과 같이 모호한 이름은 피하고, 기능과 목적을 명확히 설명하는 이름을 사용합니다.
*   **JPA 엔티티 ID**: 모든 JPA 엔티티 ID는 `Long` 타입을 사용합니다.

## 5. API 설계 가이드라인

*   **작업 흐름**: 코드를 작성하기 전에 항상 다음 순서로 API 설계를 문서화합니다: API 목록 → DTOs → DB 테이블 → 에러 처리 → 구현 단계 → 테스트 계획.
*   **컨트롤러 명확성**: 컨트롤러가 비대해지는 것을 방지하기 위해 Swagger 애너테이션은 별도의 인터페이스에 정의하고, 컨트롤러는 비즈니스 로직 매핑만 담당합니다.
*   **유효성 검사**: 요청 DTO에 `@Valid` 및 Bean Validation을 사용하여 유효성을 검사합니다.
*   **전역 에러 핸들링**: `@RestControllerAdvice`를 통해 일관된 에러 응답 형식을 유지합니다.
*   **Swagger/OpenAPI 문서화**:
    *   `@Tag`, `@Operation`, `@ApiResponses` 애너테이션은 API 인터페이스에 정의합니다.
    *   DTO 필드에는 `@Schema(example = "...")`를 사용하여 프론트엔드 개발자의 이해를 돕습니다.
    *   인증이 필요한 엔드포인트는 `@SecurityRequirement(name = "bearerAuth")`로 표시합니다.

## 6. 테스트 가이드라인

*   **엔드포인트 테스트**: 각 API 엔드포인트는 최소한 1개의 성공 케이스와 1개의 실패 케이스 테스트를 포함해야 합니다.
*   **리포지토리 테스트**: 커스텀 쿼리가 존재하는 경우에만 리포지토리 테스트를 작성합니다.
*   **MockMvc 활용**: MockMvc 테스트는 "정상/실패 케이스 + 에러 응답 형식 보장"을 중심으로 검증하며, Swagger 스니펫 생성은 하지 않습니다.

## 7. 로컬 개발 명령어

*   **테스트 실행**: `./gradlew test`
*   **애플리케이션 실행**: `./gradlew bootRun`
