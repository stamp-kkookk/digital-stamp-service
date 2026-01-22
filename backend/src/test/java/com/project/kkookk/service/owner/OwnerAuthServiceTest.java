package com.project.kkookk.service.owner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.controller.owner.dto.OwnerLoginRequest;
import com.project.kkookk.controller.owner.dto.OwnerLoginResponse;
import com.project.kkookk.controller.owner.dto.OwnerSignupRequest;
import com.project.kkookk.controller.owner.dto.OwnerSignupResponse;
import com.project.kkookk.domain.owner.OwnerAccount;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.repository.owner.OwnerAccountRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class OwnerAuthServiceTest {

    @InjectMocks private OwnerAuthService ownerAuthService;

    @Mock private OwnerAccountRepository ownerAccountRepository;

    @Mock private PasswordEncoder passwordEncoder;

    @Mock private JwtUtil jwtUtil;

    @Test
    @DisplayName("회원가입 성공")
    void signup_Success() {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "owner@example.com", "owner123", "Password1!", "홍길동", "010-1234-5678");

        given(ownerAccountRepository.existsByEmail(anyString())).willReturn(false);
        given(ownerAccountRepository.existsByLoginId(anyString())).willReturn(false);
        given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");

        OwnerAccount savedOwnerAccount =
                OwnerAccount.builder()
                        .email("owner@example.com")
                        .loginId("owner123")
                        .passwordHash("encodedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(savedOwnerAccount, "id", 1L);
        ReflectionTestUtils.setField(savedOwnerAccount, "createdAt", LocalDateTime.now());

        given(ownerAccountRepository.save(any(OwnerAccount.class))).willReturn(savedOwnerAccount);

        // when
        OwnerSignupResponse response = ownerAuthService.signup(request);

        // then
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("owner@example.com");
        assertThat(response.loginId()).isEqualTo("owner123");
        assertThat(response.name()).isEqualTo("홍길동");
        assertThat(response.phoneNumber()).isEqualTo("010-1234-5678");

        verify(ownerAccountRepository).existsByEmail("owner@example.com");
        verify(ownerAccountRepository).existsByLoginId("owner123");
        verify(passwordEncoder).encode("Password1!");
        verify(ownerAccountRepository).save(any(OwnerAccount.class));
    }

    @Test
    @DisplayName("회원가입 성공 - 로그인 ID null인 경우")
    void signup_Success_LoginIdNull() {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "owner@example.com",
                        null, // 로그인 ID null
                        "Password1!",
                        "홍길동",
                        "010-1234-5678");

        given(ownerAccountRepository.existsByEmail(anyString())).willReturn(false);
        given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");

        OwnerAccount savedOwnerAccount =
                OwnerAccount.builder()
                        .email("owner@example.com")
                        .loginId(null)
                        .passwordHash("encodedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(savedOwnerAccount, "id", 1L);
        ReflectionTestUtils.setField(savedOwnerAccount, "createdAt", LocalDateTime.now());

        given(ownerAccountRepository.save(any(OwnerAccount.class))).willReturn(savedOwnerAccount);

        // when
        OwnerSignupResponse response = ownerAuthService.signup(request);

        // then
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.loginId()).isNull();

        verify(ownerAccountRepository, never()).existsByLoginId(anyString());
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복")
    void signup_Fail_EmailDuplicated() {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "owner@example.com", "owner123", "Password1!", "홍길동", "010-1234-5678");

        given(ownerAccountRepository.existsByEmail(anyString())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> ownerAuthService.signup(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode())
                                    .isEqualTo(ErrorCode.OWNER_EMAIL_DUPLICATED);
                        });

        verify(ownerAccountRepository).existsByEmail("owner@example.com");
        verify(ownerAccountRepository, never()).save(any(OwnerAccount.class));
    }

    @Test
    @DisplayName("회원가입 실패 - 로그인 ID 중복")
    void signup_Fail_LoginIdDuplicated() {
        // given
        OwnerSignupRequest request =
                new OwnerSignupRequest(
                        "owner@example.com", "owner123", "Password1!", "홍길동", "010-1234-5678");

        given(ownerAccountRepository.existsByEmail(anyString())).willReturn(false);
        given(ownerAccountRepository.existsByLoginId(anyString())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> ownerAuthService.signup(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode())
                                    .isEqualTo(ErrorCode.OWNER_LOGIN_ID_DUPLICATED);
                        });

        verify(ownerAccountRepository).existsByEmail("owner@example.com");
        verify(ownerAccountRepository).existsByLoginId("owner123");
        verify(ownerAccountRepository, never()).save(any(OwnerAccount.class));
    }

    @Test
    @DisplayName("로그인 성공 - 이메일 사용")
    void login_Success_WithEmail() {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("owner@example.com", "Password1!");

        OwnerAccount ownerAccount =
                OwnerAccount.builder()
                        .email("owner@example.com")
                        .loginId("owner123")
                        .passwordHash("encodedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(ownerAccount, "id", 1L);

        given(ownerAccountRepository.findByEmail("owner@example.com"))
                .willReturn(Optional.of(ownerAccount));
        given(passwordEncoder.matches("Password1!", "encodedPassword")).willReturn(true);
        given(jwtUtil.generateAccessToken(anyLong(), anyString()))
                .willReturn("mock.jwt.token");

        // when
        OwnerLoginResponse response = ownerAuthService.login(request);

        // then
        assertThat(response.accessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("owner@example.com");
        assertThat(response.loginId()).isEqualTo("owner123");
        assertThat(response.name()).isEqualTo("홍길동");
        assertThat(response.phoneNumber()).isEqualTo("010-1234-5678");

        verify(ownerAccountRepository).findByEmail("owner@example.com");
        verify(passwordEncoder).matches("Password1!", "encodedPassword");
        verify(jwtUtil).generateAccessToken(1L, "owner@example.com");
    }

    @Test
    @DisplayName("로그인 성공 - 로그인 ID 사용")
    void login_Success_WithLoginId() {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("owner123", "Password1!");

        OwnerAccount ownerAccount =
                OwnerAccount.builder()
                        .email("owner@example.com")
                        .loginId("owner123")
                        .passwordHash("encodedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(ownerAccount, "id", 1L);

        given(ownerAccountRepository.findByLoginId("owner123"))
                .willReturn(Optional.of(ownerAccount));
        given(passwordEncoder.matches("Password1!", "encodedPassword")).willReturn(true);
        given(jwtUtil.generateAccessToken(anyLong(), anyString()))
                .willReturn("mock.jwt.token");

        // when
        OwnerLoginResponse response = ownerAuthService.login(request);

        // then
        assertThat(response.accessToken()).isEqualTo("mock.jwt.token");
        assertThat(response.id()).isEqualTo(1L);

        verify(ownerAccountRepository).findByLoginId("owner123");
        verify(passwordEncoder).matches("Password1!", "encodedPassword");
        verify(jwtUtil).generateAccessToken(1L, "owner@example.com");
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이메일")
    void login_Fail_EmailNotFound() {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("notfound@example.com", "Password1!");

        given(ownerAccountRepository.findByEmail("notfound@example.com"))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> ownerAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode()).isEqualTo(ErrorCode.OWNER_LOGIN_FAILED);
                        });

        verify(ownerAccountRepository).findByEmail("notfound@example.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateAccessToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 로그인 ID")
    void login_Fail_LoginIdNotFound() {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("notfound", "Password1!");

        given(ownerAccountRepository.findByLoginId("notfound")).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> ownerAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode()).isEqualTo(ErrorCode.OWNER_LOGIN_FAILED);
                        });

        verify(ownerAccountRepository).findByLoginId("notfound");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateAccessToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치")
    void login_Fail_PasswordMismatch() {
        // given
        OwnerLoginRequest request = new OwnerLoginRequest("owner@example.com", "WrongPassword!");

        OwnerAccount ownerAccount =
                OwnerAccount.builder()
                        .email("owner@example.com")
                        .loginId("owner123")
                        .passwordHash("encodedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(ownerAccount, "id", 1L);

        given(ownerAccountRepository.findByEmail("owner@example.com"))
                .willReturn(Optional.of(ownerAccount));
        given(passwordEncoder.matches("WrongPassword!", "encodedPassword")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> ownerAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        exception -> {
                            BusinessException be = (BusinessException) exception;
                            assertThat(be.getErrorCode()).isEqualTo(ErrorCode.OWNER_LOGIN_FAILED);
                        });

        verify(ownerAccountRepository).findByEmail("owner@example.com");
        verify(passwordEncoder).matches("WrongPassword!", "encodedPassword");
        verify(jwtUtil, never()).generateAccessToken(anyLong(), anyString());
    }
}
