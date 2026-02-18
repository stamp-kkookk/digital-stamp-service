package com.project.kkookk.terminal.controller;

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
import com.project.kkookk.terminal.controller.dto.TerminalLoginRequest;
import com.project.kkookk.terminal.controller.dto.TerminalLoginResponse;
import com.project.kkookk.terminal.service.TerminalAuthService;
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
        controllers = TerminalAuthController.class,
        excludeFilters = {
            @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = {SecurityConfig.class, JwtAuthenticationFilter.class})
        },
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import({GlobalExceptionHandler.class, TestSecurityConfig.class})
@DisplayName("TerminalAuthController 테스트")
class TerminalAuthControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private TerminalAuthService terminalAuthService;

    @Test
    @DisplayName("터미널 로그인 성공 - 200 OK")
    void login_Success() throws Exception {
        // given
        TerminalLoginRequest request =
                new TerminalLoginRequest("owner@example.com", "password123", 1L);

        TerminalLoginResponse response =
                new TerminalLoginResponse(
                        "mock.terminal.token", "mock.refresh.token", 10L, 1L, "꾹꾹 카페");

        given(terminalAuthService.login(any(TerminalLoginRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/public/terminal/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock.terminal.token"))
                .andExpect(jsonPath("$.ownerId").value(10))
                .andExpect(jsonPath("$.storeId").value(1))
                .andExpect(jsonPath("$.storeName").value("꾹꾹 카페"));
    }

    @Test
    @DisplayName("터미널 로그인 실패 - 이메일 누락 (400)")
    void login_Fail_EmailRequired() throws Exception {
        // given
        String requestBody =
                """
                {
                    "password": "password123",
                    "storeId": 1
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/api/public/terminal/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("터미널 로그인 실패 - storeId 누락 (400)")
    void login_Fail_StoreIdRequired() throws Exception {
        // given
        String requestBody =
                """
                {
                    "email": "owner@example.com",
                    "password": "password123"
                }
                """;

        // when & then
        mockMvc.perform(
                        post("/api/public/terminal/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("터미널 로그인 실패 - 인증 실패 (401)")
    void login_Fail_Unauthorized() throws Exception {
        // given
        TerminalLoginRequest request =
                new TerminalLoginRequest("owner@example.com", "wrongPassword", 1L);

        given(terminalAuthService.login(any(TerminalLoginRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OWNER_LOGIN_FAILED));

        // when & then
        mockMvc.perform(
                        post("/api/public/terminal/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("터미널 로그인 실패 - 매장 접근 권한 없음 (403)")
    void login_Fail_Forbidden() throws Exception {
        // given
        TerminalLoginRequest request =
                new TerminalLoginRequest("owner@example.com", "password123", 999L);

        given(terminalAuthService.login(any(TerminalLoginRequest.class)))
                .willThrow(new BusinessException(ErrorCode.TERMINAL_ACCESS_DENIED));

        // when & then
        mockMvc.perform(
                        post("/api/public/terminal/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }
}
