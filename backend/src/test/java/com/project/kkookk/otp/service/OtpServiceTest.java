package com.project.kkookk.otp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class OtpServiceTest {

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService();
    }

    @Test
    @DisplayName("OTP 요청 성공")
    void requestOtp_Success() {
        // given
        String phone = "010-1234-5678";

        // when & then
        otpService.requestOtp(phone);
    }

    @Test
    @DisplayName("OTP 검증 성공")
    void verifyOtp_Success() throws Exception {
        // given
        String phone = "010-1234-5678";
        otpService.requestOtp(phone);

        // OTP 코드 추출 (테스트를 위해 리플렉션 사용)
        java.lang.reflect.Field otpStoreField = OtpService.class.getDeclaredField("otpStore");
        otpStoreField.setAccessible(true);
        @SuppressWarnings("unchecked")
        java.util.concurrent.ConcurrentHashMap<String, Object> otpStore =
                (java.util.concurrent.ConcurrentHashMap<String, Object>)
                        otpStoreField.get(otpService);
        Object otpData = otpStore.get(phone);
        java.lang.reflect.Method codeMethod = otpData.getClass().getDeclaredMethod("code");
        String code = (String) codeMethod.invoke(otpData);

        // when
        boolean result = otpService.verifyOtp(phone, code);

        // then
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("OTP 검증 실패 - 존재하지 않는 OTP")
    void verifyOtp_Fail_NotFound() {
        // given
        String phone = "010-1234-5678";
        String wrongCode = "123456";

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(phone, wrongCode))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_INVALID);
    }

    @Test
    @DisplayName("OTP 검증 실패 - 잘못된 코드")
    void verifyOtp_Fail_InvalidCode() throws Exception {
        // given
        String phone = "010-1234-5678";
        otpService.requestOtp(phone);
        String wrongCode = "999999";

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(phone, wrongCode))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_INVALID);
    }

    @Test
    @DisplayName("OTP 검증 실패 - 3회 시도 초과")
    void verifyOtp_Fail_AttemptsExceeded() {
        // given
        String phone = "010-9999-8888";
        otpService.requestOtp(phone);
        String wrongCode = "999999";

        // when & then - 1차 시도
        assertThatThrownBy(() -> otpService.verifyOtp(phone, wrongCode))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_INVALID);

        // 2차 시도
        assertThatThrownBy(() -> otpService.verifyOtp(phone, wrongCode))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_INVALID);

        // 3차 시도 - 시도 횟수 초과
        assertThatThrownBy(() -> otpService.verifyOtp(phone, wrongCode))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_ATTEMPTS_EXCEEDED);
    }

    @Test
    @DisplayName("Rate Limit 테스트 - 1분 내 재요청 차단")
    void requestOtp_Fail_RateLimitExceeded() {
        // given
        String phone = "010-7777-6666";
        otpService.requestOtp(phone);

        // when & then - 1분 내 재요청 시도
        assertThatThrownBy(() -> otpService.requestOtp(phone))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_RATE_LIMIT_EXCEEDED);
    }

    @Test
    @DisplayName("OTP 만료 테스트")
    void verifyOtp_Fail_Expired() throws Exception {
        // given
        String phone = "010-5555-4444";
        otpService.requestOtp(phone);

        // OTP 생성 시간을 4분 전으로 변경 (3분 TTL 초과)
        java.lang.reflect.Field otpStoreField = OtpService.class.getDeclaredField("otpStore");
        otpStoreField.setAccessible(true);
        @SuppressWarnings("unchecked")
        java.util.concurrent.ConcurrentHashMap<String, Object> otpStore =
                (java.util.concurrent.ConcurrentHashMap<String, Object>)
                        otpStoreField.get(otpService);
        Object otpData = otpStore.get(phone);

        // OTP 데이터의 createdAt을 4분 전으로 변경
        java.lang.reflect.Method codeMethod = otpData.getClass().getDeclaredMethod("code");
        String code = (String) codeMethod.invoke(otpData);

        java.lang.reflect.Constructor<?> constructor =
                otpData.getClass()
                        .getDeclaredConstructor(
                                String.class, java.time.LocalDateTime.class, int.class);
        Object expiredOtpData =
                constructor.newInstance(code, java.time.LocalDateTime.now().minusMinutes(4), 0);
        otpStore.put(phone, expiredOtpData);

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(phone, code))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_EXPIRED);
    }
}
