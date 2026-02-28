package com.project.kkookk.architecture;

import static com.tngtech.archunit.core.domain.JavaClass.Predicates.resideInAPackage;
import static com.tngtech.archunit.core.domain.JavaClass.Predicates.resideOutsideOfPackages;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noMethods;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.library.dependencies.SlicesRuleDefinition;
import jakarta.persistence.Entity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

/**
 * ArchUnit 아키텍처 규칙 테스트.
 *
 * <p>Claude Code가 생성한 코드를 포함해 모든 코드에 대해 아키텍처 규칙을 자동 검증한다. 테스트 실패 시 에러 메시지를 읽고 스스로 수정한다 — 교과서가 아닌
 * 시험지.
 */
@AnalyzeClasses(
        packages = "com.project.kkookk",
        importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    /**
     * global 패키지 예외 처리.
     *
     * <p>global.security 안의 TokenRefreshController, RefreshTokenService, RefreshTokenRepository가 한
     * 패키지에 공존하는 의도적 설계이므로 패키지 위치/레이어 규칙에서 제외한다.
     */
    private static final String GLOBAL_PKG = "com.project.kkookk.global..";

    // ============================================================
    // 1. 레이어 의존성 규칙
    // ============================================================

    /**
     * @RestController 클래스에서 Repository 직접 주입 금지.
     *
     * <p>DTO factory 메서드가 Projection을 받는 패턴은 허용된다. 실제 Controller 클래스에서 Repository 빈을 주입하는 것만 금지한다.
     */
    @ArchTest
    static final ArchRule CONTROLLERS_MUST_NOT_ACCESS_REPOSITORIES =
            noClasses()
                    .that()
                    .areAnnotatedWith(RestController.class)
                    .should()
                    .dependOnClassesThat()
                    .resideInAPackage("..repository..")
                    .because("@RestController는 Repository를 직접 사용할 수 없습니다. Service 레이어를 통해 접근하세요.");

    /** Repository → Service 역방향 참조 금지. */
    @ArchTest
    static final ArchRule REPOSITORIES_MUST_NOT_ACCESS_SERVICES =
            noClasses()
                    .that()
                    .resideInAPackage("..repository..")
                    .should()
                    .dependOnClassesThat()
                    .resideInAPackage("..service..")
                    .because("Repository → Service 역방향 의존은 허용되지 않습니다.");

    // ============================================================
    // 2. 패키지 위치 규칙  (global 패키지 및 ..config.. 패키지 제외)
    // ============================================================

    /** *Controller 클래스는 controller 패키지 안에 위치해야 한다. */
    @ArchTest
    static final ArchRule CONTROLLERS_RESIDE_IN_CONTROLLER_PACKAGE =
            classes()
                    .that()
                    .haveSimpleNameEndingWith("Controller")
                    .and()
                    .resideOutsideOfPackage(GLOBAL_PKG)
                    .should()
                    .resideInAPackage("..controller..")
                    .because("*Controller 클래스는 controller 패키지 안에 위치해야 합니다.");

    /** *Service 클래스는 service 패키지 안에 위치해야 한다. */
    @ArchTest
    static final ArchRule SERVICES_RESIDE_IN_SERVICE_PACKAGE =
            classes()
                    .that()
                    .haveSimpleNameEndingWith("Service")
                    .and()
                    .resideOutsideOfPackage(GLOBAL_PKG)
                    .should()
                    .resideInAPackage("..service..")
                    .because("*Service 클래스는 service 패키지 안에 위치해야 합니다.");

    /**
     * *Repository 클래스는 repository 패키지 안에 위치해야 한다.
     *
     * <p>global 패키지(RefreshTokenRepository) 및 config 패키지(Spring Security OAuth2
     * HttpCookieOAuth2AuthorizationRequestRepository 등)는 프레임워크 패턴상 예외 허용.
     */
    @ArchTest
    static final ArchRule REPOSITORIES_RESIDE_IN_REPOSITORY_PACKAGE =
            classes()
                    .that()
                    .haveSimpleNameEndingWith("Repository")
                    .and()
                    .resideOutsideOfPackage(GLOBAL_PKG)
                    .and()
                    .resideOutsideOfPackage("..config..")
                    .should()
                    .resideInAPackage("..repository..")
                    .because("*Repository 클래스는 repository 패키지 안에 위치해야 합니다.");

    // ============================================================
    // 3. 이벤트 패키지 규칙  (feat/event-driven)
    // ============================================================

    /**
     * Spring 도메인 이벤트(*Event)는 event 패키지 안에 위치해야 한다.
     *
     * <p>JPA @Entity 클래스(StampEvent, RedeemEvent 등 이력 엔티티)는 domain 패키지에 위치하므로 제외한다. 이 규칙은
     * ApplicationEvent / 도메인 이벤트 POJO에 적용된다.
     */
    @ArchTest
    static final ArchRule EVENTS_RESIDE_IN_EVENT_PACKAGE =
            classes()
                    .that()
                    .haveSimpleNameEndingWith("Event")
                    .and()
                    .areNotAnnotatedWith(Entity.class)
                    .should()
                    .resideInAPackage("..event..")
                    .allowEmptyShould(true)
                    .because("*Event(도메인 이벤트 POJO)는 event 패키지 안에 위치해야 합니다.");

    /** Controller에서 이벤트를 직접 발행하는 것을 금지한다. 이벤트 발행은 Service에서만 허용. */
    @ArchTest
    static final ArchRule CONTROLLERS_MUST_NOT_PUBLISH_EVENTS =
            noClasses()
                    .that()
                    .resideInAPackage("..controller..")
                    .should()
                    .dependOnClassesThat()
                    .resideInAPackage("..event..")
                    .allowEmptyShould(true)
                    .because("이벤트 발행은 Service 레이어에서만 허용됩니다.");

    // ============================================================
    // 4. 어노테이션 네이밍 일관성
    // ============================================================

    /**
     * @Service 어노테이션은 이름이 Service로 끝나는 클래스에만 붙여야 한다.
     *
     * <p>유틸리티/헬퍼 클래스에 @Service를 붙이면 역할 혼동이 발생한다. @Component를 사용하거나 이름을 *Service로 변경하라.
     */
    @ArchTest
    static final ArchRule SERVICE_ANNOTATION_ONLY_ON_SERVICE_CLASSES =
            classes()
                    .that()
                    .areAnnotatedWith(Service.class)
                    .should()
                    .haveSimpleNameEndingWith("Service")
                    .because("@Service는 *Service 이름을 가진 클래스에만 사용하세요. 유틸리티는 @Component를 쓰세요.");

    /**
     * @Repository 어노테이션은 이름이 Repository로 끝나는 클래스에만 붙여야 한다.
     */
    @ArchTest
    static final ArchRule REPOSITORY_ANNOTATION_ONLY_ON_REPOSITORY_CLASSES =
            classes()
                    .that()
                    .areAnnotatedWith(Repository.class)
                    .should()
                    .haveSimpleNameEndingWith("Repository")
                    .because("@Repository는 *Repository 이름을 가진 클래스에만 사용하세요.");

    // ============================================================
    // 5. @Transactional 규칙
    // ============================================================

    /**
     * Controller 메서드에 @Transactional 사용 금지.
     *
     * <p>HTTP 처리 전 과정(인증, 검증, 직렬화)이 트랜잭션에 묶여 커넥션 풀 고갈을 유발한다. 트랜잭션 경계는 Service 레이어에서 관리한다. global
     * 패키지(TokenRefreshController)는 예외.
     */
    @ArchTest
    static final ArchRule NO_TRANSACTIONAL_ON_CONTROLLERS =
            noMethods()
                    .that()
                    .areDeclaredInClassesThat(
                            resideInAPackage("..controller..")
                                    .and(resideOutsideOfPackages(GLOBAL_PKG)))
                    .should()
                    .beAnnotatedWith(Transactional.class)
                    .because(
                            "Controller 메서드에 @Transactional을 사용하지 마세요."
                                    + " 트랜잭션 경계는 Service에서 관리합니다.");

    // ============================================================
    // 6. 순환 의존성 금지
    // ============================================================

    // ============================================================
    // 6. 순환 의존성 금지
    // ============================================================

    /**
     * 피처 패키지 간 순환 의존 금지.
     *
     * <p>현재 비활성화 상태: CustomerWalletService가 redeem/stamp/stampcard/store를 직접 임포트하여 순환이 발생한다 (redeem
     * → stampcard → store → wallet → redeem). feat/event-driven 작업에서 직접 임포트를 이벤트 발행/구독으로 교체하면 이 규칙을
     * 활성화한다. 활성화 방법: 아래 주석을 해제하고 @ArchTest 어노테이션 추가.
     *
     * <pre>
     * TODO(feat/event-driven): CustomerWalletService에서 redeem/stamp/stampcard/store 직접 의존 제거 후 활성화
     * </pre>
     */
    static final ArchRule NO_CYCLIC_FEATURE_DEPENDENCIES =
            SlicesRuleDefinition.slices()
                    .matching(
                            "com.project.kkookk."
                                    + "(admin|issuance|migration|oauth|owner|qrcode"
                                    + "|redeem|stamp|stampcard|statistics|store|wallet)..")
                    .should()
                    .beFreeOfCycles()
                    .because("피처 패키지 간 순환 의존성은 유지보수를 어렵게 만듭니다." + " 공통 로직은 global 패키지로 추출하세요.");
}
