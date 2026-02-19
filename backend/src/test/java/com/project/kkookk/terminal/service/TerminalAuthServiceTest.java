package com.project.kkookk.terminal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.terminal.controller.dto.TerminalLoginRequest;
import com.project.kkookk.terminal.controller.dto.TerminalLoginResponse;
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
@DisplayName("TerminalAuthService 테스트")
class TerminalAuthServiceTest {

    @InjectMocks private TerminalAuthService terminalAuthService;

    @Mock private OwnerAccountRepository ownerAccountRepository;

    @Mock private StoreRepository storeRepository;

    @Mock private PasswordEncoder passwordEncoder;

    @Mock private JwtUtil jwtUtil;

    @Mock private RefreshTokenService refreshTokenService;

    @Test
    @DisplayName("터미널 로그인 성공")
    void login_Success() {
        // given
        String email = "owner@example.com";
        String password = "password123";
        Long storeId = 1L;
        Long ownerId = 10L;

        TerminalLoginRequest request = new TerminalLoginRequest(email, password, storeId);

        OwnerAccount owner =
                OwnerAccount.builder()
                        .email(email)
                        .passwordHash("hashedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(owner, "id", ownerId);

        Store store = new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", null, null, null, ownerId);
        ReflectionTestUtils.setField(store, "id", storeId);
        store.transitionTo(StoreStatus.LIVE);

        given(ownerAccountRepository.findByEmail(email)).willReturn(Optional.of(owner));
        given(passwordEncoder.matches(password, "hashedPassword")).willReturn(true);
        given(storeRepository.findByIdAndOwnerAccountId(storeId, ownerId))
                .willReturn(Optional.of(store));
        given(jwtUtil.generateTerminalToken(ownerId, email, storeId))
                .willReturn("mock.terminal.token");
        given(refreshTokenService.issueTerminalRefreshToken(ownerId, email, storeId))
                .willReturn("mock.refresh.token");

        // when
        TerminalLoginResponse response = terminalAuthService.login(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("mock.terminal.token");
        assertThat(response.ownerId()).isEqualTo(ownerId);
        assertThat(response.storeId()).isEqualTo(storeId);
        assertThat(response.storeName()).isEqualTo("꾹꾹 카페");
    }

    @Test
    @DisplayName("터미널 로그인 실패 - 이메일 없음")
    void login_Fail_EmailNotFound() {
        // given
        TerminalLoginRequest request =
                new TerminalLoginRequest("unknown@example.com", "password123", 1L);

        given(ownerAccountRepository.findByEmail("unknown@example.com"))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> terminalAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.OWNER_LOGIN_FAILED);
    }

    @Test
    @DisplayName("터미널 로그인 실패 - 비밀번호 불일치")
    void login_Fail_WrongPassword() {
        // given
        String email = "owner@example.com";
        TerminalLoginRequest request = new TerminalLoginRequest(email, "wrongPassword", 1L);

        OwnerAccount owner =
                OwnerAccount.builder()
                        .email(email)
                        .passwordHash("hashedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(owner, "id", 10L);

        given(ownerAccountRepository.findByEmail(email)).willReturn(Optional.of(owner));
        given(passwordEncoder.matches("wrongPassword", "hashedPassword")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> terminalAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.OWNER_LOGIN_FAILED);
    }

    @Test
    @DisplayName("터미널 로그인 실패 - 매장 접근 권한 없음")
    void login_Fail_StoreAccessDenied() {
        // given
        String email = "owner@example.com";
        String password = "password123";
        Long storeId = 999L; // 소유하지 않은 매장
        Long ownerId = 10L;

        TerminalLoginRequest request = new TerminalLoginRequest(email, password, storeId);

        OwnerAccount owner =
                OwnerAccount.builder()
                        .email(email)
                        .passwordHash("hashedPassword")
                        .name("홍길동")
                        .phoneNumber("010-1234-5678")
                        .build();
        ReflectionTestUtils.setField(owner, "id", ownerId);

        given(ownerAccountRepository.findByEmail(email)).willReturn(Optional.of(owner));
        given(passwordEncoder.matches(password, "hashedPassword")).willReturn(true);
        given(storeRepository.findByIdAndOwnerAccountId(storeId, ownerId))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> terminalAuthService.login(request))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.TERMINAL_ACCESS_DENIED);
    }
}
