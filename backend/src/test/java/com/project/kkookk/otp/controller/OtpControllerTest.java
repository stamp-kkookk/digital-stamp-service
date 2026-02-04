package com.project.kkookk.otp.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.config.SecurityConfig;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.exception.GlobalExceptionHandler;
import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.otp.dto.OtpRequestDto;
import com.project.kkookk.otp.dto.OtpVerifyDto;
import com.project.kkookk.otp.service.OtpService;
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
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
@Import({GlobalExceptionHandler.class, TestSecurityConfig.class})
class OtpControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private OtpService otpService;

    @Test
    @DisplayName("OTP 요청 성공")
    void requestOtp_Success() throws Exception {
        // given
        OtpRequestDto request = new OtpRequestDto("010-1234-5678");
        given(otpService.requestOtp(anyString())).willReturn("123456");

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.devOtpCode").value("123456"));
    }

    @Test
    @DisplayName("OTP 요청 실패 - 잘못된 전화번호 형식")
    void requestOtp_Fail_InvalidPhone() throws Exception {
        // given
        OtpRequestDto request = new OtpRequestDto("123-4567-8901");

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("OTP 요청 실패 - Rate Limit 초과")
    void requestOtp_Fail_RateLimitExceeded() throws Exception {
        // given
        OtpRequestDto request = new OtpRequestDto("010-1234-5678");
        given(otpService.requestOtp(anyString()))
                .willThrow(new BusinessException(ErrorCode.OTP_RATE_LIMIT_EXCEEDED));

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/request")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("OTP_001"));
    }

    @Test
    @DisplayName("OTP 검증 성공")
    void verifyOtp_Success() throws Exception {
        // given
        OtpVerifyDto request = new OtpVerifyDto("010-1234-5678", "123456");
        given(otpService.verifyOtp(anyString(), anyString())).willReturn(true);

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true));
    }

    @Test
    @DisplayName("OTP 검증 실패 - 잘못된 OTP 코드 형식")
    void verifyOtp_Fail_InvalidCodeFormat() throws Exception {
        // given
        OtpVerifyDto request = new OtpVerifyDto("010-1234-5678", "12345"); // 5자리

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("OTP 검증 실패 - OTP 만료")
    void verifyOtp_Fail_Expired() throws Exception {
        // given
        OtpVerifyDto request = new OtpVerifyDto("010-1234-5678", "123456");
        doThrow(new BusinessException(ErrorCode.OTP_EXPIRED))
                .when(otpService)
                .verifyOtp(anyString(), anyString());

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("OTP_002"));
    }

    @Test
    @DisplayName("OTP 검증 실패 - 잘못된 코드")
    void verifyOtp_Fail_Invalid() throws Exception {
        // given
        OtpVerifyDto request = new OtpVerifyDto("010-1234-5678", "999999");
        doThrow(new BusinessException(ErrorCode.OTP_INVALID))
                .when(otpService)
                .verifyOtp(anyString(), anyString());

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("OTP_003"));
    }

    @Test
    @DisplayName("OTP 검증 실패 - 시도 횟수 초과")
    void verifyOtp_Fail_AttemptsExceeded() throws Exception {
        // given
        OtpVerifyDto request = new OtpVerifyDto("010-1234-5678", "123456");
        doThrow(new BusinessException(ErrorCode.OTP_ATTEMPTS_EXCEEDED))
                .when(otpService)
                .verifyOtp(anyString(), anyString());

        // when & then
        mockMvc.perform(
                        post("/api/public/otp/verify")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("OTP_004"));
    }
}
