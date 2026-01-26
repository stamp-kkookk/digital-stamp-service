package com.project.kkookk.global.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.global.util.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class JwtAuthenticationIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private JwtUtil jwtUtil;

    @Test
    @DisplayName("인증이 필요없는 엔드포인트는 토큰 없이 접근 가능 - /api/owner/auth/**")
    void publicEndpoint_NoToken_Success() throws Exception {
        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        "{\"email\":\"test@example.com\",\"password\":\"Password1!\"}"))
                .andExpect(status().isUnauthorized()); // 로그인 실패는 정상 (401), 인증 필터는 통과
    }

    @Test
    @DisplayName("보호된 엔드포인트는 토큰 없이 접근 불가 - 403 Forbidden")
    void protectedEndpoint_NoToken_Forbidden() throws Exception {
        // when & then
        // /api/owner/auth/** 제외한 모든 /api/** 엔드포인트는 인증 필요
        mockMvc.perform(
                        post("/api/owner/stores")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("보호된 엔드포인트는 유효한 토큰으로 접근 가능 - 인증 통과")
    void protectedEndpoint_ValidToken_Success() throws Exception {
        // given
        Long ownerId = 1L;
        String email = "owner@example.com";
        String token = jwtUtil.generateAccessToken(ownerId, email);

        // when & then
        // 실제 엔드포인트가 없어서 404가 나올 수 있지만, 인증(403)은 통과해야 함
        mockMvc.perform(
                        post("/api/owner/stores")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                .andExpect(
                        result -> {
                            int status = result.getResponse().getStatus();
                            // 403 (인증 실패)가 아니면 성공 - 404나 다른 에러는 인증 통과를 의미
                            if (status == 403) {
                                throw new AssertionError("인증이 실패했습니다 (403 Forbidden)");
                            }
                        });
    }

    @Test
    @DisplayName("보호된 엔드포인트는 무효한 토큰으로 접근 불가 - 403 Forbidden")
    void protectedEndpoint_InvalidToken_Forbidden() throws Exception {
        // given
        String invalidToken = "invalid.jwt.token";

        // when & then
        mockMvc.perform(
                        post("/api/owner/stores")
                                .header("Authorization", "Bearer " + invalidToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("보호된 엔드포인트는 Bearer 접두사 없는 토큰으로 접근 불가 - 403 Forbidden")
    void protectedEndpoint_NoBearerPrefix_Forbidden() throws Exception {
        // given
        Long ownerId = 1L;
        String email = "owner@example.com";
        String token = jwtUtil.generateAccessToken(ownerId, email);

        // when & then
        mockMvc.perform(
                        post("/api/owner/stores")
                                .header("Authorization", token) // Bearer 접두사 없음
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Swagger UI는 토큰 없이 접근 가능")
    void swaggerUi_NoToken_Success() throws Exception {
        // when & then
        mockMvc.perform(post("/swagger-ui/index.html"))
                .andExpect(
                        result -> {
                            int status = result.getResponse().getStatus();
                            // 403 (인증 실패)가 아니면 성공
                            if (status == 403) {
                                throw new AssertionError("Swagger UI 접근이 거부되었습니다 (403 Forbidden)");
                            }
                        });
    }

    @Test
    @DisplayName("API Docs는 토큰 없이 접근 가능")
    void apiDocs_NoToken_Success() throws Exception {
        // when & then
        mockMvc.perform(post("/v3/api-docs"))
                .andExpect(
                        result -> {
                            int status = result.getResponse().getStatus();
                            // 403 (인증 실패)가 아니면 성공
                            if (status == 403) {
                                throw new AssertionError("API Docs 접근이 거부되었습니다 (403 Forbidden)");
                            }
                        });
    }
}
