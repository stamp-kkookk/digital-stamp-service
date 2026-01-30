package com.project.kkookk.wallet.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.config.SecurityConfig;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.exception.GlobalExceptionHandler;
import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.service.CustomerWalletService;
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
        controllers = WalletController.class,
        excludeFilters = {
            @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = {SecurityConfig.class, JwtAuthenticationFilter.class})
        },
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import({GlobalExceptionHandler.class, TestSecurityConfig.class})
class WalletControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private CustomerWalletService customerWalletService;

    @Test
    @DisplayName("지갑 생성 성공 - 201 CREATED")
    void register_Success() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-1234-5678", "홍길동", "길동이");

        WalletRegisterResponse response =
                new WalletRegisterResponse(
                        "mock.jwt.token", 1L, "010-1234-5678", "홍길동", "길동이");

        given(customerWalletService.register(any(WalletRegisterRequest.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").value("mock.jwt.token"))
                .andExpect(jsonPath("$.walletId").value(1))
                .andExpect(jsonPath("$.phone").value("010-1234-5678"))
                .andExpect(jsonPath("$.name").value("홍길동"))
                .andExpect(jsonPath("$.nickname").value("길동이"));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 누락 (400)")
    void register_Fail_PhoneRequired() throws Exception {
        // given
        String requestBody =
                """
                {
                    "name": "홍길동",
                    "nickname": "길동이"
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("지갑 생성 실패 - 이름 누락 (400)")
    void register_Fail_NameRequired() throws Exception {
        // given
        String requestBody =
                """
                {
                    "phone": "010-1234-5678",
                    "nickname": "길동이"
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("지갑 생성 실패 - 닉네임 누락 (400)")
    void register_Fail_NicknameRequired() throws Exception {
        // given
        String requestBody =
                """
                {
                    "phone": "010-1234-5678",
                    "name": "홍길동"
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("지갑 생성 실패 - 잘못된 전화번호 형식 (400)")
    void register_Fail_InvalidPhoneFormat() throws Exception {
        // given
        WalletRegisterRequest request = new WalletRegisterRequest("123-4567", "홍길동", "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("지갑 생성 실패 - 이름 최대 길이 초과 (400)")
    void register_Fail_NameTooLong() throws Exception {
        // given
        String longName = "a".repeat(51); // 51자
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-1234-5678", longName, "길동이");

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("지갑 생성 실패 - 닉네임 최대 길이 초과 (400)")
    void register_Fail_NicknameTooLong() throws Exception {
        // given
        String longNickname = "a".repeat(51); // 51자
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-1234-5678", "홍길동", longNickname);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 중복 (409)")
    void register_Fail_PhoneDuplicated() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-1234-5678", "홍길동", "길동이");

        given(customerWalletService.register(any(WalletRegisterRequest.class)))
                .willThrow(new BusinessException(ErrorCode.WALLET_PHONE_DUPLICATED));

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("WALLET_001"))
                .andExpect(jsonPath("$.message").value("이미 등록된 전화번호입니다"));
    }

    @Test
    @DisplayName("지갑 생성 성공 - 전화번호 하이픈 없는 형식")
    void register_Success_PhoneWithoutHyphen() throws Exception {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest("01012345678", "홍길동", "길동이");

        WalletRegisterResponse response =
                new WalletRegisterResponse("mock.jwt.token", 1L, "01012345678", "홍길동", "길동이");

        given(customerWalletService.register(any(WalletRegisterRequest.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.phone").value("01012345678"));
    }

    @Test
    @DisplayName("지갑 생성 성공 - 이름/닉네임 경계값 (50자)")
    void register_Success_BoundaryValues() throws Exception {
        // given
        String maxLengthString = "a".repeat(50); // 정확히 50자
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-1234-5678", maxLengthString, maxLengthString);

        WalletRegisterResponse response =
                new WalletRegisterResponse(
                        "mock.jwt.token", 1L, "010-1234-5678", maxLengthString, maxLengthString);

        given(customerWalletService.register(any(WalletRegisterRequest.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(maxLengthString))
                .andExpect(jsonPath("$.nickname").value(maxLengthString));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 빈 문자열 (400)")
    void register_Fail_EmptyStrings() throws Exception {
        // given
        String requestBody =
                """
                {
                    "phone": "",
                    "name": "",
                    "nickname": ""
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("지갑 생성 실패 - 공백만 있는 문자열 (400)")
    void register_Fail_BlankStrings() throws Exception {
        // given
        String requestBody =
                """
                {
                    "phone": "   ",
                    "name": "   ",
                    "nickname": "   "
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/api/public/wallet/register")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
