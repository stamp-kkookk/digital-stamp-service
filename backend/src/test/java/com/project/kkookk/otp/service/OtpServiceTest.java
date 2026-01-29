package com.project.kkookk.otp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;

import com.project.kkookk.common.limit.application.FailureLimitService;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.otp.config.OtpProperties;
import com.project.kkookk.otp.controller.dto.OtpRequestRequest;
import com.project.kkookk.otp.controller.dto.OtpRequestResponse;
import com.project.kkookk.otp.controller.dto.OtpVerifyRequest;
import com.project.kkookk.otp.controller.dto.OtpVerifyResponse;
import com.project.kkookk.otp.domain.OtpSessionData;
import com.project.kkookk.otp.domain.OtpSessionStatus;
import com.project.kkookk.otp.service.sms.SmsProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @InjectMocks private OtpService otpService;

    @Mock private CacheManager cacheManager;

    @Mock private SmsProvider smsProvider;

    @Mock private OtpProperties otpProperties;

    @Mock private OtpProperties.RateLimit rateLimit;

    @Mock private OtpProperties.Dev dev;

    @Mock private Cache sessionCache;

    @Mock private Cache rateLimitCache;

    @Mock private FailureLimitService failureLimitService;

    @BeforeEach
    void setUp() {
        // lenient()를 사용하여 불필요한 stubbing 경고 방지
        lenient().when(otpProperties.getExpirationSeconds()).thenReturn(180);
        lenient().when(otpProperties.getMaxAttempts()).thenReturn(5);
        lenient().when(otpProperties.getRateLimit()).thenReturn(rateLimit);
        lenient().when(otpProperties.getDev()).thenReturn(dev);

        lenient().when(rateLimit.getWindowSeconds()).thenReturn(60);
        lenient().when(rateLimit.getMaxRequests()).thenReturn(3);

        lenient().when(dev.getFixedCode()).thenReturn("123456");

        lenient().when(cacheManager.getCache("otpSession")).thenReturn(sessionCache);
        lenient().when(cacheManager.getCache("otpRateLimit")).thenReturn(rateLimitCache);
    }

    @Test
    @DisplayName("OTP 요청 성공")
    void requestOtp_Success() {
        // given
        OtpRequestRequest request = new OtpRequestRequest("010-1234-5678");

        given(rateLimitCache.get(anyString(), eq(Integer.class))).willReturn(null);

        // when
        OtpRequestResponse response = otpService.requestOtp(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.verificationId()).isNotNull();
        assertThat(response.expiresAt()).isNotNull();
        assertThat(response.otpCode()).isEqualTo("123456");

        verify(sessionCache).evict(anyString());
        verify(sessionCache).put(eq("otp:session:010-1234-5678"), any(OtpSessionData.class));
        verify(sessionCache).put(anyString(), eq("010-1234-5678"));
        verify(smsProvider).sendOtp("010-1234-5678", "123456");
        verify(rateLimitCache).put(eq("otp:rate:010-1234-5678"), eq(1));
    }

    @Test
    @DisplayName("OTP 요청 실패 - Rate Limit 초과")
    void requestOtp_Fail_RateLimitExceeded() {
        // given
        OtpRequestRequest request = new OtpRequestRequest("010-1234-5678");

        given(rateLimitCache.get(eq("otp:rate:010-1234-5678"), eq(Integer.class))).willReturn(3);

        // when & then
        assertThatThrownBy(() -> otpService.requestOtp(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode())
                                    .isEqualTo(ErrorCode.OTP_RATE_LIMIT_EXCEEDED);
                        });

        verify(sessionCache, org.mockito.Mockito.never()).evict(anyString());
        verify(smsProvider, org.mockito.Mockito.never()).sendOtp(anyString(), anyString());
    }

    @Test
    @DisplayName("OTP 요청 실패 - SMS 발송 실패")
    void requestOtp_Fail_SmsSendFailed() {
        // given
        OtpRequestRequest request = new OtpRequestRequest("010-1234-5678");

        given(rateLimitCache.get(anyString(), eq(Integer.class))).willReturn(null);
        doThrow(new RuntimeException("SMS 발송 오류"))
                .when(smsProvider)
                .sendOtp(anyString(), anyString());

        // when & then
        assertThatThrownBy(() -> otpService.requestOtp(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode()).isEqualTo(ErrorCode.OTP_SEND_FAILED);
                        });

        verify(sessionCache).evict(anyString());
        verify(sessionCache).put(anyString(), any(OtpSessionData.class));
        verify(smsProvider).sendOtp(anyString(), anyString());
    }

    @Test
    @DisplayName("기존 세션 삭제 확인 - 동일 전화번호 재요청")
    void requestOtp_DeleteExistingSession() {
        // given
        OtpRequestRequest request = new OtpRequestRequest("010-1234-5678");

        given(rateLimitCache.get(anyString(), eq(Integer.class))).willReturn(1);

        // when
        OtpRequestResponse response = otpService.requestOtp(request);

        // then
        assertThat(response).isNotNull();

        verify(sessionCache).evict(eq("otp:session:010-1234-5678"));
        verify(sessionCache).put(eq("otp:session:010-1234-5678"), any(OtpSessionData.class));
        verify(rateLimitCache).put(eq("otp:rate:010-1234-5678"), eq(2));
    }

    @Test
    @DisplayName("OTP 검증 성공")
    void verifyOtp_Success() {
        // given
        String phone = "010-1234-5678";
        String verificationId = "550e8400-e29b-41d4-a716-446655440000";
        String otpCode = "123456";

        OtpVerifyRequest request = new OtpVerifyRequest(phone, verificationId, otpCode);

        OtpSessionData sessionData =
                OtpSessionData.builder()
                        .phone(phone)
                        .otpCode(otpCode)
                        .verificationId(verificationId)
                        .status(OtpSessionStatus.PENDING)
                        .expiresAt(java.time.LocalDateTime.now().plusMinutes(3))
                        .createdAt(java.time.LocalDateTime.now())
                        .build();

        given(sessionCache.get(eq("otp:verify:" + verificationId), eq(String.class)))
                .willReturn(phone);
        given(sessionCache.get(eq("otp:session:" + phone), eq(OtpSessionData.class)))
                .willReturn(sessionData);

        // when
        OtpVerifyResponse response = otpService.verifyOtp(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.verified()).isTrue();
        assertThat(response.phone()).isEqualTo(phone);

        verify(sessionCache).put(eq("otp:session:" + phone), any(OtpSessionData.class));
    }

    @Test
    @DisplayName("OTP 검증 실패 - OTP 코드 불일치")
    void verifyOtp_Fail_InvalidCode() {
        // given
        String phone = "010-1234-5678";
        String verificationId = "550e8400-e29b-41d4-a716-446655440000";
        String wrongOtpCode = "999999";

        OtpVerifyRequest request = new OtpVerifyRequest(phone, verificationId, wrongOtpCode);

        OtpSessionData sessionData =
                OtpSessionData.builder()
                        .phone(phone)
                        .otpCode("123456")
                        .verificationId(verificationId)
                        .status(OtpSessionStatus.PENDING)
                        .expiresAt(java.time.LocalDateTime.now().plusMinutes(3))
                        .createdAt(java.time.LocalDateTime.now())
                        .build();

        given(sessionCache.get(eq("otp:verify:" + verificationId), eq(String.class)))
                .willReturn(phone);
        given(sessionCache.get(eq("otp:session:" + phone), eq(OtpSessionData.class)))
                .willReturn(sessionData);

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode()).isEqualTo(ErrorCode.OTP_INVALID);
                        });

        // 실패 기록 확인
        verify(failureLimitService).recordFailure(phone);
    }

    @Test
    @DisplayName("OTP 검증 실패 - 세션 없음")
    void verifyOtp_Fail_NotFound() {
        // given
        String phone = "010-1234-5678";
        String verificationId = "invalid-verification-id";
        String otpCode = "123456";

        OtpVerifyRequest request = new OtpVerifyRequest(phone, verificationId, otpCode);

        given(sessionCache.get(eq("otp:verify:" + verificationId), eq(String.class)))
                .willReturn(null);

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode()).isEqualTo(ErrorCode.OTP_NOT_FOUND);
                        });
    }

    @Test
    @DisplayName("OTP 검증 실패 - 전화번호 불일치")
    void verifyOtp_Fail_PhoneMismatch() {
        // given
        String phone = "010-1234-5678";
        String wrongPhone = "010-9999-9999";
        String verificationId = "550e8400-e29b-41d4-a716-446655440000";
        String otpCode = "123456";

        OtpVerifyRequest request = new OtpVerifyRequest(wrongPhone, verificationId, otpCode);

        OtpSessionData sessionData =
                OtpSessionData.builder()
                        .phone(phone)
                        .otpCode(otpCode)
                        .verificationId(verificationId)
                        .status(OtpSessionStatus.PENDING)
                        .expiresAt(java.time.LocalDateTime.now().plusMinutes(3))
                        .createdAt(java.time.LocalDateTime.now())
                        .build();

        given(sessionCache.get(eq("otp:verify:" + verificationId), eq(String.class)))
                .willReturn(phone);
        given(sessionCache.get(eq("otp:session:" + phone), eq(OtpSessionData.class)))
                .willReturn(sessionData);

        // when & then
        assertThatThrownBy(() -> otpService.verifyOtp(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode()).isEqualTo(ErrorCode.OTP_INVALID);
                        });
    }
}
