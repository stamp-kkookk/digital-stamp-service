package com.project.kkookk.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noFields;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;

/**
 * 테스트 코드 컨벤션 규칙.
 *
 * <p>프로덕션 코드가 아닌 테스트 코드에만 적용되는 규칙을 검증한다.
 */
@AnalyzeClasses(
        packages = "com.project.kkookk",
        importOptions = ImportOption.OnlyIncludeTests.class)
class TestingConventionsTest {

    /**
     * @MockBean 사용 금지. @MockitoBean을 사용해야 한다.
     *
     * <p>@MockBean은 Spring Boot 3.4+에서 deprecated. 매번 Spring Context를 재생성해 테스트 속도가
     * 저하된다. @MockitoBean은 Context를 재사용하면서 Bean만 교체한다.
     */
    @ArchTest
    static final ArchRule NO_MOCK_BEAN =
            noFields()
                    .should()
                    .beAnnotatedWith(MockBean.class)
                    .because("@MockBean 대신 @MockitoBean을 사용하세요. (CLAUDE.md 참조)");

    /**
     * @SpyBean 사용 금지. @MockitoSpyBean을 사용해야 한다.
     */
    @ArchTest
    static final ArchRule NO_SPY_BEAN =
            noFields()
                    .should()
                    .beAnnotatedWith(SpyBean.class)
                    .because("@SpyBean 대신 @MockitoSpyBean을 사용하세요. (CLAUDE.md 참조)");
}
