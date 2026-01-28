package com.project.kkookk.wallet.controller;

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
import com.project.kkookk.wallet.controller.config.WalletTestSecurityConfig;
import com.project.kkookk.wallet.controller.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.controller.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.service.WalletService;
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
        controllers = WalletController.class,
        excludeFilters = {
            @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = {SecurityConfig.class, JwtAuthenticationFilter.class})
        },
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import({GlobalExceptionHandler.class, WalletTestSecurityConfig.class})
class WalletControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private WalletService walletService;

    @Test
    @DisplayName("지갑 생성 성공 - 200 OK")
    @WithMockUser
    void registerWallet_Success() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        WalletRegisterResponse response =
                new WalletRegisterResponse(
                        1L,
                        "010-1234-5678",
                        "홍길동",
                        "길동이",
                        CustomerWalletStatus.ACTIVE,
                        LocalDateTime.of(2026, 1, 28, 10, 30, 0),
                        "test.jwt.token");

        given(walletService.registerWallet(any(WalletRegisterRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.walletId").value(1))
                .andExpect(jsonPath("$.phone").value("010-1234-5678"))
                .andExpect(jsonPath("$.name").value("홍길동"))
                .andExpect(jsonPath("$.nickname").value("길동이"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.createdAt").value("2026-01-28T10:30:00"))
                .andExpect(jsonPath("$.accessToken").value("test.jwt.token"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 형식 오류 (400)")
    @WithMockUser
    void registerWallet_Fail_InvalidPhoneFormat() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "1234567890", // 잘못된 형식
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 필수 필드 누락 (400)")
    @WithMockUser
    void registerWallet_Fail_RequiredFieldMissing() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "", // 전화번호 누락
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - OTP 검증 실패 (400)")
    @WithMockUser
    void registerWallet_Fail_OtpVerificationFailed() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "999999",
                        "홍길동",
                        "길동이");

        given(walletService.registerWallet(any(WalletRegisterRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OTP_VERIFICATION_FAILED));

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("WALLET_002"))
                .andExpect(jsonPath("$.message").value("OTP 검증에 실패했습니다."));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 중복 (409)")
    @WithMockUser
    void registerWallet_Fail_PhoneDuplicated() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        "길동이");

        given(walletService.registerWallet(any(WalletRegisterRequest.class)))
                .willThrow(new BusinessException(ErrorCode.WALLET_PHONE_DUPLICATED));

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("WALLET_001"))
                .andExpect(jsonPath("$.message").value("이미 등록된 전화번호입니다."));
    }

    @Test
    @DisplayName("지갑 생성 실패 - OTP 코드 형식 오류 (400)")
    @WithMockUser
    void registerWallet_Fail_InvalidOtpCodeFormat() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "12345", // 6자리가 아님
                        "홍길동",
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 이름 길이 초과 (400)")
    @WithMockUser
    void registerWallet_Fail_NameTooLong() throws Exception {
        // given
        String longName = "a".repeat(51); // 50자 초과
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        longName,
                        "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 닉네임 길이 초과 (400)")
    @WithMockUser
    void registerWallet_Fail_NicknameTooLong() throws Exception {
        // given
        String longNickname = "a".repeat(51); // 50자 초과
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "550e8400-e29b-41d4-a716-446655440000",
                        "123456",
                        "홍길동",
                        longNickname);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }
}
