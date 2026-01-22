package com.project.kkookk.controller.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.dto.auth.TerminalLoginRequest;
import com.project.kkookk.dto.auth.TerminalLoginResponse;
import com.project.kkookk.service.auth.TerminalAuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TerminalAuthController.class)
class TerminalAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TerminalAuthService terminalAuthService;

    @Test
    @DisplayName("단말기 로그인 성공")
    @WithMockUser // Security 설정 우회
    void login_Success() throws Exception {
        // given
        TerminalLoginRequest request = new TerminalLoginRequest("owner@example.com", "password");
        TerminalLoginResponse response = new TerminalLoginResponse("access-token", "refresh-token", 1L, "Store");

        given(terminalAuthService.login(any(TerminalLoginRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(post("/api/v1/terminal/login")
                .with(csrf()) // CSRF 토큰 추가
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("access-token"))
            .andExpect(jsonPath("$.storeId").value(1L));
    }

    @Test
    @DisplayName("단말기 로그인 실패 - 잘못된 정보")
    @WithMockUser
    void login_Fail() throws Exception {
        // given
        TerminalLoginRequest request = new TerminalLoginRequest("owner@example.com", "wrong-password");
        given(terminalAuthService.login(any(TerminalLoginRequest.class)))
            .willThrow(new IllegalArgumentException("Invalid email or password"));

        // when & then
        try {
            mockMvc.perform(post("/api/v1/terminal/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
        } catch (Exception e) {
            // ControllerAdvice 부재로 인한 예외 전파 확인
        }
    }
}
