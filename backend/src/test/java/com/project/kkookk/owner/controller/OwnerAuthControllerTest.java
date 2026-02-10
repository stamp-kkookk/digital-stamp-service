package com.project.kkookk.owner.controller;

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
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import com.project.kkookk.owner.controller.dto.OwnerLoginRequest;
import com.project.kkookk.owner.controller.dto.OwnerLoginResponse;
import com.project.kkookk.owner.controller.dto.OwnerSignupRequest;
import com.project.kkookk.owner.controller.dto.OwnerSignupResponse;
import com.project.kkookk.owner.service.OwnerAuthService;
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
        controllers = OwnerAuthController.class,
        excludeFilters = {
            @ComponentScan.Filter(
                    type = FilterType.ASSIGNABLE_TYPE,
                    classes = {SecurityConfig.class, JwtAuthenticationFilter.class})
        },
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import({GlobalExceptionHandler.class, TestSecurityConfig.class})
class OwnerAuthControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private OwnerAuthService ownerAuthService;

    @Test
    @DisplayName("회원가입 성공 - 201 Created")
    @WithMockUser
    void signup_Success() throws Exception {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest("owner@example.com", "Password1!", "홍길동", "010-1234-5678");

        OwnerSignupResponse response =
                new OwnerSignupResponse(
                        1L, "owner@example.com", "홍길동", "010-1234-5678", LocalDateTime.now());

        given(ownerAuthService.signup(any(OwnerSignupRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/signup")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.email").value("owner@example.com"))
                .andExpect(jsonPath("$.name").value("홍길동"))
                .andExpect(jsonPath("$.phoneNumber").value("010-1234-5678"));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 누락 (400)")
    @WithMockUser
    void signup_Fail_EmailRequired() throws Exception {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "", // 이메일 누락
                        "Password1!",
                        "홍길동",
                        "010-1234-5678");

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/signup")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("회원가입 실패 - 비밀번호 형식 오류 (400)")
    @WithMockUser
    void signup_Fail_InvalidPasswordFormat() throws Exception {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "owner@example.com",
                        "password", // 특수문자, 숫자 없음
                        "홍길동",
                        "010-1234-5678");

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/signup")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("회원가입 실패 - 전화번호 형식 오류 (400)")
    @WithMockUser
    void signup_Fail_InvalidPhoneFormat() throws Exception {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "owner@example.com", "Password1!", "홍길동", "1234567890"); // 잘못된 형식

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/signup")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복 (409)")
    @WithMockUser
    void signup_Fail_EmailDuplicated() throws Exception {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest("owner@example.com", "Password1!", "홍길동", "010-1234-5678");

        given(ownerAuthService.signup(any(OwnerSignupRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OWNER_EMAIL_DUPLICATED));

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/signup")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("OWNER_EMAIL_DUPLICATED"));
    }

    @Test
    @DisplayName("로그인 성공 - 이메일 사용 (200)")
    @WithMockUser
    void login_Success_WithEmail() throws Exception {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("owner@example.com", "Password1!");

        OwnerLoginResponse response =
                new OwnerLoginResponse(
                        "mock.jwt.token", 1L, "owner@example.com", "홍길동", "010-1234-5678");

        given(ownerAuthService.login(any(OwnerLoginRequest.class))).willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock.jwt.token"))
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.email").value("owner@example.com"))
                .andExpect(jsonPath("$.name").value("홍길동"))
                .andExpect(jsonPath("$.phoneNumber").value("010-1234-5678"));
    }

    @Test
    @DisplayName("로그인 실패 - 이메일 누락 (400)")
    @WithMockUser
    void login_Fail_EmailRequired() throws Exception {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("", "Password1!");

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 누락 (400)")
    @WithMockUser
    void login_Fail_PasswordRequired() throws Exception {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("owner@example.com", "");

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("로그인 실패 - 잘못된 이메일 형식 (400)")
    @WithMockUser
    void login_Fail_InvalidEmailFormat() throws Exception {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("invalid-email", "Password1!");

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 길이 부족 (400)")
    @WithMockUser
    void login_Fail_PasswordTooShort() throws Exception {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("owner@example.com", "short");

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
    }

    @Test
    @DisplayName("로그인 실패 - 이메일 또는 비밀번호 불일치 (401)")
    @WithMockUser
    void login_Fail_InvalidCredentials() throws Exception {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("owner@example.com", "WrongPassword!");

        given(ownerAuthService.login(any(OwnerLoginRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OWNER_LOGIN_FAILED));

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/login")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("OWNER_LOGIN_FAILED"))
                .andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 올바르지 않습니다"));
    }
}
