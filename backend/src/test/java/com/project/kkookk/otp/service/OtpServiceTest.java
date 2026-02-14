package com.project.kkookk.otp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.otp.service.OtpService.OtpVerifyResult;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock private JwtUtil jwtUtil;

    @Mock private CustomerWalletRepository customerWalletRepository;

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService(jwtUtil, customerWalletRepository);
    }

    @Test
    @DisplayName("OTP 요청 성공")
    void requestOtp_Success() {
        // given
        String phone = "01012345678";

        // when
        String otpCode = otpService.requestOtp(phone);

        // then
        assertThat(otpCode).isNotNull().hasSize(6);
    }

    @Test
    @DisplayName("OTP 검증 성공 - StepUp 토큰 발급")
    void verifyOtp_Success_WithStepUpToken() throws Exception {
        // given
        String phone = "01012345678";
        String stepUpToken = "test-stepup-token";
        Long walletId = 1L;

        otpService.requestOtp(phone);

        // OTP 코드 추출 (테스트를 위해 리플렉션 사용)
        String code = extractOtpCode(phone);

        CustomerWallet wallet =
                CustomerWallet.builder().phone(phone).name("테스트").nickname("테스터").build();
        // walletId를 설정하기 위해 리플렉션 사용
        java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(wallet, walletId);

        given(customerWalletRepository.findByPhone(phone)).willReturn(Optional.of(wallet));
        given(jwtUtil.generateStepUpToken(walletId)).willReturn(stepUpToken);

        // when
        OtpVerifyResult result = otpService.verifyOtp(phone, code);

        // then
        assertThat(result.verified()).isTrue();
        assertThat(result.stepUpToken()).isEqualTo(stepUpToken);
    }

    @Test
    @DisplayName("OTP 검증 성공 - 미등록 사용자 (StepUp 토큰 없음)")
    void verifyOtp_Success_NoWallet() throws Exception {
        // given
        String phone = "01098765432";
        otpService.requestOtp(phone);
        String code = extractOtpCode(phone);

        given(customerWalletRepository.findByPhone(phone)).willReturn(Optional.empty());

        // when
        OtpVerifyResult result = otpService.verifyOtp(phone, code);

        // then
        assertThat(result.verified()).isTrue();
        assertThat(result.stepUpToken()).isNull();
    }

    @Test
    @DisplayName("OTP 검증 실패 - 존재하지 않는 OTP")
    void verifyOtp_Fail_NotFound() {
        // given
        String phone = "01012345678";
        String wrongCode = "123456";

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(phone, wrongCode))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_INVALID);
    }

    @Test
    @DisplayName("OTP 검증 실패 - 잘못된 코드")
    void verifyOtp_Fail_InvalidCode() {
        // given
        String phone = "01012345678";
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
        String phone = "01099998888";
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
    @DisplayName("Rate Limit 테스트 - 1분 내 2회까지 허용, 3회째 차단")
    void requestOtp_Fail_RateLimitExceeded() {
        // given
        String phone = "01077776666";
        otpService.requestOtp(phone); // 1회
        otpService.requestOtp(phone); // 2회 (허용)

        // when & then - 3회째 요청 시 차단
        assertThatThrownBy(() -> otpService.requestOtp(phone))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_RATE_LIMIT_EXCEEDED);
    }

    @Test
    @DisplayName("OTP 만료 테스트")
    void verifyOtp_Fail_Expired() throws Exception {
        // given
        String phone = "01055554444";
        otpService.requestOtp(phone);

        // OTP 생성 시간을 4분 전으로 변경 (3분 TTL 초과)
        java.lang.reflect.Field otpStoreField = OtpService.class.getDeclaredField("otpStore");
        otpStoreField.setAccessible(true);
        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Object> otpStore =
                (ConcurrentHashMap<String, Object>) otpStoreField.get(otpService);
        Object otpData = otpStore.get(phone);

        // OTP 데이터의 createdAt을 4분 전으로 변경
        java.lang.reflect.Method codeMethod = otpData.getClass().getDeclaredMethod("code");
        String code = (String) codeMethod.invoke(otpData);

        java.lang.reflect.Constructor<?> constructor =
                otpData.getClass()
                        .getDeclaredConstructor(String.class, LocalDateTime.class, int.class);
        Object expiredOtpData =
                constructor.newInstance(code, LocalDateTime.now().minusMinutes(4), 0);
        otpStore.put(phone, expiredOtpData);

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(phone, code))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_EXPIRED);
    }

    private String extractOtpCode(String phone) throws Exception {
        java.lang.reflect.Field otpStoreField = OtpService.class.getDeclaredField("otpStore");
        otpStoreField.setAccessible(true);
        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Object> otpStore =
                (ConcurrentHashMap<String, Object>) otpStoreField.get(otpService);
        Object otpData = otpStore.get(phone);
        java.lang.reflect.Method codeMethod = otpData.getClass().getDeclaredMethod("code");
        return (String) codeMethod.invoke(otpData);
    }
}
