# Backend Guide

Stack: Java 17, Spring Boot 3.5, Spring Data JPA, MySQL 8.0, springdoc-openapi 2.7.0

## Commands
```bash
./gradlew bootRun              # 서버 시작 (port 8080)
./gradlew test                 # 테스트
./gradlew spotlessApply        # 포맷팅 자동 수정
./gradlew check                # 전체 CI 검증
```

## Architecture
Feature-based packages: `com.project.kkookk.{feature}/`
Layers: Controller -> Service -> Repository -> Domain
Controller는 *Api.java 인터페이스를 구현 (Swagger 어노테이션 분리).

## Must-Know Patterns
- 에러: `throw new BusinessException(ErrorCode.XXX)`
- 페이지네이션: `PageResponse.from(page)`
- 베이스 엔티티: `BaseTimeEntity` 상속 (id, createdAt, updatedAt)
- 인증 Principal: `CustomerPrincipal`, `OwnerPrincipal`
- 테스트: `@MockitoBean` 사용 (`@MockBean` 금지)

## Before Coding
`docs/api-reference.md`와 `docs/utility-registry.md`를 읽고 기존 코드 중복 방지.
Skills: `.claude/skills/backend-core/`, `.claude/skills/backend-testing/`
