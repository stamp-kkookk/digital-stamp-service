package com.project.kkookk.controller.owner;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.controller.owner.dto.OwnerSignupRequest;
import com.project.kkookk.controller.owner.dto.OwnerSignupResponse;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.exception.GlobalExceptionHandler;
import com.project.kkookk.service.owner.OwnerAuthService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OwnerAuthController.class)
@Import(GlobalExceptionHandler.class)
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
                new OwnerSignupRequest(
                        "owner@example.com", "owner123", "Password1!", "홍길동", "010-1234-5678");

        OwnerSignupResponse response =
                new OwnerSignupResponse(
                        1L,
                        "owner@example.com",
                        "owner123",
                        "홍길동",
                        "010-1234-5678",
                        LocalDateTime.now());

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
                .andExpect(jsonPath("$.loginId").value("owner123"))
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
                        "owner123",
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
                        "owner123",
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
                        "owner@example.com",
                        "owner123",
                        "Password1!",
                        "홍길동",
                        "1234567890"); // 잘못된 형식

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
                new OwnerSignupRequest(
                        "owner@example.com", "owner123", "Password1!", "홍길동", "010-1234-5678");

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
    @DisplayName("회원가입 실패 - 로그인 ID 중복 (409)")
    @WithMockUser
    void signup_Fail_LoginIdDuplicated() throws Exception {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "owner@example.com", "owner123", "Password1!", "홍길동", "010-1234-5678");

        given(ownerAuthService.signup(any(OwnerSignupRequest.class)))
                .willThrow(new BusinessException(ErrorCode.OWNER_LOGIN_ID_DUPLICATED));

        // when & then
        mockMvc.perform(
                        post("/api/owner/auth/signup")
                                .with(SecurityMockMvcRequestPostProcessors.csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("OWNER_LOGIN_ID_DUPLICATED"));
    }
}
