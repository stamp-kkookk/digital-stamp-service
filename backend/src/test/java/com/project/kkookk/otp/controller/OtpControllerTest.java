package com.project.kkookk.otp.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.config.SecurityConfig;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.exception.GlobalExceptionHandler;
import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.otp.controller.config.OtpTestSecurityConfig;
import com.project.kkookk.otp.controller.dto.OtpRequestRequest;
import com.project.kkookk.otp.controller.dto.OtpRequestResponse;
import com.project.kkookk.otp.controller.dto.OtpVerifyRequest;
import com.project.kkookk.otp.controller.dto.OtpVerifyResponse;
import com.project.kkookk.otp.service.OtpService;
import java.time.Duration;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = OtpController.class,
        excludeFilters = {
            @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = {SecurityConfig.class, JwtAuthenticationFilter.class})
        },
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import({GlobalExceptionHandler.class, OtpTestSecurityConfig.class})
class OtpControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private OtpService otpService;

    @Test
    @DisplayName("OTP 요청 성공 - 200 OK")
    @WithMockUser
    void requestOtp_Success() throws Exception {
        // given
        OtpRequestRequest request = new OtpRequestRequest("010-1234-5678");

        OtpRequestResponse response =
                OtpRequestResponse.of(
                        "550e8400-e29b-41d4-a716-446655440000",
                        LocalDateTime.of(2026, 1, 28, 12, 34, 56),
                        "123456");

        given(otpService.requestOtp(any(OtpRequestRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationId").value("550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(jsonPath("$.expiresAt").value("2026-01-28T12:34:56"))
                .andExpect(jsonPath("$.otpCode").value("123456"));
    }

    @Test
    @DisplayName("OTP 요청 실패 - 전화번호 형식 오류 (400)")
    @WithMockUser
    void requestOtp_Fail_InvalidPhoneFormat() throws Exception {
        // given
        OtpRequestRequest request = new OtpRequestRequest("1234567890"); // 잘못된 형식

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("OTP 요청 실패 - 전화번호 누락 (400)")
    @WithMockUser
    void requestOtp_Fail_PhoneRequired() throws Exception {
        // given
        OtpRequestRequest request = new OtpRequestRequest(""); // 전화번호 누락

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("OTP 요청 실패 - Rate Limit 초과 (429)")
    @WithMockUser
    void requestOtp_Fail_RateLimitExceeded() throws Exception {
        // given
        OtpRequestRequest request = new OtpRequestRequest("010-1234-5678");

        given(otpService.requestOtp(any(OtpRequestRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OTP_RATE_LIMIT_EXCEEDED));

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("OTP_001"))
                .andExpect(jsonPath("$.message").value("OTP 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요."));
    }

    @Test
    @DisplayName("OTP 요청 실패 - SMS 발송 실패 (503)")
    @WithMockUser
    void requestOtp_Fail_SmsSendFailed() throws Exception {
        // given
        OtpRequestRequest request = new OtpRequestRequest("010-1234-5678");

        given(otpService.requestOtp(any(OtpRequestRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OTP_SEND_FAILED));

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("OTP_002"))
                .andExpect(jsonPath("$.message").value("OTP 발송에 실패했습니다."));
    }

    @Test
    @DisplayName("OTP 검증 성공 - 200 OK")
    @WithMockUser
    void verifyOtp_Success() throws Exception {
        // given
        OtpVerifyRequest request =
                new OtpVerifyRequest(
                        "010-1234-5678", "550e8400-e29b-41d4-a716-446655440000", "123456");

        OtpVerifyResponse response = OtpVerifyResponse.of(true, "010-1234-5678");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.phone").value("010-1234-5678"));
    }

    @Test
    @DisplayName("OTP 검증 실패 - OTP 코드 불일치 (400)")
    @WithMockUser
    void verifyOtp_Fail_InvalidCode() throws Exception {
        // given
        OtpVerifyRequest request =
                new OtpVerifyRequest(
                        "010-1234-5678", "550e8400-e29b-41d4-a716-446655440000", "999999");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OTP_INVALID));

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("OTP_006"))
                .andExpect(jsonPath("$.message").value("잘못된 OTP 코드입니다."));
    }

    @Test
    @DisplayName("OTP 검증 실패 - OTP 만료 (400)")
    @WithMockUser
    void verifyOtp_Fail_Expired() throws Exception {
        // given
        OtpVerifyRequest request =
                new OtpVerifyRequest(
                        "010-1234-5678", "550e8400-e29b-41d4-a716-446655440000", "123456");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OTP_EXPIRED));

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("OTP_003"))
                .andExpect(jsonPath("$.message").value("OTP가 만료되었습니다."));
    }




    @Test
    @DisplayName("OTP 검증 실패 - 계정 차단 (429)")
    @WithMockUser
    void verifyOtp_Fail_Blocked() throws Exception {
        // given
        OtpVerifyRequest request =
            new OtpVerifyRequest(
                "010-1234-5678", "550e8400-e29b-41d4-a716-446655440000", "123456");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class)))
            .willThrow(new com.project.kkookk.common.limit.exception.BlockedException(ErrorCode.FAILURE_LIMIT_EXCEEDED, 3, Duration.ofSeconds(60)));

        // when & then
        mockMvc.perform(
                post("/api/public/otp/verify")
                    .with(SecurityMockMvcRequestPostProcessors.csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isTooManyRequests())
            .andExpect(jsonPath("$.code").value("FAILURE_LIMIT_001"))
            .andExpect(jsonPath("$.message").value("시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요."))
            .andExpect(jsonPath("$.blockedDurationSeconds").value(60))
            .andExpect(jsonPath("$.failureCount").value(3));
    }

    @Test
    @DisplayName("OTP 검증 실패 - 세션 없음 (404)")
    @WithMockUser
    void verifyOtp_Fail_NotFound() throws Exception {
        // given
        OtpVerifyRequest request =
                new OtpVerifyRequest(
                        "010-1234-5678", "invalid-verification-id", "123456");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OTP_NOT_FOUND));

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("OTP_005"))
                .andExpect(jsonPath("$.message").value("OTP 세션을 찾을 수 없습니다."));
    }

    @Test
    @DisplayName("OTP 검증 실패 - OTP 코드 형식 오류 (400)")
    @WithMockUser
    void verifyOtp_Fail_InvalidCodeFormat() throws Exception {
        // given
        OtpVerifyRequest request =
                new OtpVerifyRequest("010-1234-5678", "550e8400-e29b-41d4-a716-446655440000", "12345");

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }
}
