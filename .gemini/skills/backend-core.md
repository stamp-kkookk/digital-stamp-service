# Gemini Backend Core Directives: Kkookk API Development

## Summary
- **Objective**: Design, implement, and maintain Spring Boot backend services for the Kkookk project.
- **Scope**: REST API endpoints, DTOs, entities, database schema, business logic, security.
- **Key Principles**: Security first, layered architecture, strict code style, structured API design.

## 1. 이 스킬 사용 시점

Kkookk 프로젝트의 `backend/` 디렉토리 내에서 다음 작업을 수행할 때 이 지시사항을 준수합니다:
*   REST API 엔드포인트를 생성하거나 수정할 때
*   DTO, 엔티티, 또는 데이터베이스 스키마를 설계할 때
*   서비스 계층의 비즈니스 로직을 구현할 때
*   보안 기능 (OTP, Rate Limiting, 감사 로깅)을 추가할 때

## 2. 필수 보안 요구사항 (CRITICAL)

### OTP 본인 인증 강화 (OTP Step-up Authentication) - MANDATORY
*   **제한된 작업**: '보상 사용 (Redeem)'과 같은 민감한 작업 수행 전에는 반드시 OTP 세션 유효성을 검증해야 합니다. (선택적으로 프로필 편집, 계정 복구 등에도 적용 가능)
*   **구현**: 서비스 계층에서 주요 작업 수행 전 `OtpSession.isValid()`를 통해 검증합니다.
*   **세션 TTL**: OTP 세션은 약 10분 정도의 유효 시간을 가집니다.
*   **에러 처리**: OTP 미검증 시에는 `403` HTTP 상태 코드와 `"OTP_REQUIRED"` 에러 코드를 반환합니다.
*   **안티 패턴**: 클라이언트 측의 "otpVerified" 플래그를 **절대 신뢰하지 않고**, 항상 백엔드에서 세션을 검증합니다.

### Rate Limiting 및 무차별 대입 공격 방어 (Brute-force Protection)
*   전화번호 + 이름 조회와 같이 무차별 대입 공격에 취약한 기능에는 Rate Limiting 및 쿨다운 정책을 적용합니다.
*   점주 전용 엔드포인트는 반드시 보안이 적용되어야 합니다.
*   MVP에서는 단말기가 점주 세션을 공유하지만, 모든 작업은 로깅해야 합니다.

### 감사 로깅 (Audit Logging)
스탬프 발급/보상 사용/마이그레이션 이벤트 발생 시 다음 정보를 반드시 로깅합니다: `walletId`, `storeId`, `stampCardId`, `timestamp`, `result`.

## 3. 기술 스택

### 기본 스택
*   Java 17
*   Spring Boot 3.x
*   Spring Web
*   유효성 검사 (Bean Validation)
*   Spring Data JPA
*   MySQL

### 선택적 스택 (필요 시에만 사용)
*   Spring Security
*   Redis (TTL / Rate Limiting 목적)
*   Testcontainers

## 4. 아키텍처

### 패키지 전략 (기능 기반)
`com.yourteam.kkoookk` 아래에 `global` 패키지와 함께, `controller`, `service`, `repository`, `domain` 계층을 기능(feature)별로 구성합니다. 예시: `controller/owner/`, `service/stampcard/`, `domain/wallet/` 등.

### 계층별 책임
*   **Controller**: HTTP 요청 처리, DTO 매핑, 유효성 검사, HTTP 상태 코드 반환. 컨트롤러는 얇게 유지합니다.
*   **Service**: 유스케이스 오케스트레이션, 트랜잭션 관리, 비즈니스 로직 적용.
*   **Domain**: 엔티티, 값 객체, 도메인 로직 (불변성, 규칙) 포함. 비즈니스 규칙은 도메인에 배치합니다.
*   **Repository**: 영속성 관리 및 데이터 쿼리.

## 5. 코드 스타일

### 기본 원칙
*   **Google Java Style**을 따르되, 다음을 준수합니다:
    *   들여쓰기: 4칸 스페이스
    *   최대 라인 길이: 120자

### 네이밍 컨벤션
*   변수/메서드/클래스: `camelCase` (클래스는 `PascalCase`)
*   모호한 이름 피하기: `Data`, `Info`, `Item`, `Util`, `Common` 등 사용 금지.
*   약어 사용 자제.

### Boolean 네이밍
*   로컬 boolean 변수: `is...` 접두사 사용 (예: `boolean isValid`).
*   엔티티 boolean 필드: `is` 접두사 **사용 금지** (Lombok 게터 이슈). 예: `private boolean active;`.

### `find*` vs `get*`
*   `find*`: 존재하지 않을 수 있는 경우 (Optional 또는 빈 리스트 반환).
*   `get*`: 반드시 존재해야 하는 경우 (없으면 예외 발생).

### Lombok 사용
*   `@Getter`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j` 사용 허용.
*   JPA 엔티티의 기본 생성자는 `@NoArgsConstructor(access = PROTECTED)`로 정의합니다.

### Imports
*   와일드카드(`*`) 임포트 사용 금지.
*   프로덕션 코드에서는 정적 임포트 사용을 피합니다 (테스트 코드의 `assert` 정적 임포트는 허용).

### 중괄호
단일 라인 `if` 문이라도 중괄호 `{}`를 생략하지 않습니다.

### 복잡성 관리
*   중첩 깊이를 2단계 내외로 유지합니다.
*   `early return`과 메서드 추출을 통해 복잡성을 낮춥니다.

## 6. API 설계 (필수 출력 형식)

새로운 API를 구현하기 전에, 항상 다음 구조로 설계 내용을 제시합니다.

### 1) 엔드포인트
*   메서드 (GET, POST 등) + 경로 (URL)
*   인증 요구사항
*   HTTP 상태 코드

### 2) 요청(Request)/응답(Response) DTOs
*   각 DTO의 필드와 타입, 설명

### 3) DB 모델
*   관련 테이블 및 주요 컬럼
*   인덱스 (필요한 경우에만 명시)

### 4) 유효성 검사 및 예외 처리
*   어떤 유효성 검사가 필요한지, 발생 가능한 예외 및 처리 방안

### 5) 구현 단계
*   Controller → Service → Repository 순서로 구현 단계를 간략하게 기술

### 6) 테스트 케이스
*   성공 케이스
*   실패 케이스

### 7) API 설계 체크리스트 (MVP)
*   API 계약 문서화 (DTO + 상태 코드 + 에러 형식)
*   **MVP 제약**: 웹소켓보다는 폴링을 선호하며, TTL 및 멱등성(idempotency)을 명세에 명시합니다.

## 7. 영속성 (JPA)

### 일반 원칙
*   애그리거트 단위로 JPA 엔티티를 사용합니다.
*   서비스 계층 메서드에는 `@Transactional`을 적용합니다.
*   읽기 전용 쿼리에는 `@Transactional(readOnly = true)`를 사용합니다.

### 인덱스
*   `walletId`, `storeId`와 같이 빠른 조회가 필요한 컬럼에는 인덱스를 고려합니다.

### 멱등성 (Idempotency)
*   고유 제약 조건(Unique Constraints)을 활용하여 (예: 보상별 하나의 활성 세션) 한 번만 완료되도록 강제합니다.

## 8. PR 체크리스트 (구현 후 자체 검토)

*   [ ] DTO 유효성 검사가 존재해야 합니다.
*   [ ] 에러 응답이 일관되어야 합니다.
*   [ ] 트랜잭션 경계가 올바르게 설정되어야 합니다.
*   [ ] 멱등성 / TTL이 필요한 곳에 고려되었어야 합니다.
*   [ ] 테스트 (성공 + 실패 케이스)가 추가되어야 합니다.
*   [ ] 설정 파일에 민감 정보가 포함되지 않아야 합니다.
