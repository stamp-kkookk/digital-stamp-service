package com.project.kkookk.migration.util;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.project.kkookk.migration.service.exception.MigrationImageTooLargeException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class Base64ImageValidatorTest {

    @Test
    @DisplayName("유효한 Base64 이미지 검증 성공")
    void validate_Success_ValidBase64() {
        // given
        String validBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRg";

        // when & then
        assertThatCode(() -> Base64ImageValidator.validate(validBase64)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Data URL prefix 없는 순수 Base64 검증 성공")
    void validate_Success_PureBase64() {
        // given
        String pureBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD";

        // when & then
        assertThatCode(() -> Base64ImageValidator.validate(pureBase64)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("검증 실패 - 이미지 크기 초과 (5MB 이상)")
    void validate_Fail_ImageTooLarge() {
        // given - 약 7MB의 Base64 문자열
        String largeBase64 = "data:image/jpeg;base64," + "A".repeat(10_000_000);

        // when & then
        assertThatThrownBy(() -> Base64ImageValidator.validate(largeBase64))
                .isInstanceOf(MigrationImageTooLargeException.class);
    }

    @Test
    @DisplayName("검증 실패 - null 입력")
    void validate_Fail_NullInput() {
        // given
        String nullBase64 = null;

        // when & then
        assertThatThrownBy(() -> Base64ImageValidator.validate(nullBase64))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Image data is required");
    }

    @Test
    @DisplayName("검증 실패 - 빈 문자열")
    void validate_Fail_EmptyString() {
        // given
        String emptyBase64 = "";

        // when & then
        assertThatThrownBy(() -> Base64ImageValidator.validate(emptyBase64))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Image data is required");
    }

    @Test
    @DisplayName("검증 실패 - 잘못된 Base64 형식")
    void validate_Fail_InvalidBase64() {
        // given
        String invalidBase64 = "data:image/jpeg;base64,!@#$%^&*()";

        // when & then
        assertThatThrownBy(() -> Base64ImageValidator.validate(invalidBase64))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid Base64 image data");
    }

    @Test
    @DisplayName("경계값 테스트 - 정확히 5MB")
    void validate_Success_ExactlyFiveMB() {
        // given - 정확히 5MB (5 * 1024 * 1024 bytes)
        // Base64 인코딩은 3바이트를 4문자로 변환하므로, 5MB를 만들려면 약 6,710,886 문자 필요
        String fiveMBBase64 = "data:image/jpeg;base64," + "A".repeat(6_710_886);

        // when & then
        assertThatCode(() -> Base64ImageValidator.validate(fiveMBBase64))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("경계값 테스트 - 5MB + 1바이트 초과")
    void validate_Fail_JustOverFiveMB() {
        // given - 약 7MB (명확하게 5MB를 초과하는 크기)
        String largeBase64 = "data:image/jpeg;base64," + "A".repeat(10_000_000);

        // when & then
        assertThatThrownBy(() -> Base64ImageValidator.validate(largeBase64))
                .isInstanceOf(MigrationImageTooLargeException.class);
    }
}
