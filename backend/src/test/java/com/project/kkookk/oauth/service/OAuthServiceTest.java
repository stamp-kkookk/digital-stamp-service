package com.project.kkookk.oauth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.oauth.controller.dto.CompleteCustomerSignupRequest;
import com.project.kkookk.oauth.controller.dto.CompleteOwnerSignupRequest;
import com.project.kkookk.oauth.controller.dto.OAuthLoginResponse;
import com.project.kkookk.oauth.domain.OAuthAccount;
import com.project.kkookk.oauth.domain.OAuthProvider;
import com.project.kkookk.oauth.repository.OAuthAccountRepository;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.service.CustomerWalletService;
import io.jsonwebtoken.Claims;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class OAuthServiceTest {

    @Mock private OAuthAccountRepository oauthAccountRepository;
    @Mock private OwnerAccountRepository ownerAccountRepository;
    @Mock private CustomerWalletRepository customerWalletRepository;
    @Mock private CustomerWalletService customerWalletService;
    @Mock private JwtUtil jwtUtil;
    @Mock private RefreshTokenService refreshTokenService;

    @InjectMocks private OAuthService oauthService;

    private CustomerWallet createWallet(Long id, String phone, String name, String nickname) {
        CustomerWallet wallet =
                CustomerWallet.builder().phone(phone).name(name).nickname(nickname).build();
        ReflectionTestUtils.setField(wallet, "id", id);
        return wallet;
    }

    private OwnerAccount createOwner(Long id, String email, String name, String nickname) {
        OwnerAccount owner =
                OwnerAccount.builder()
                        .email(email)
                        .name(name)
                        .nickname(nickname)
                        .phoneNumber("01012345678")
                        .build();
        ReflectionTestUtils.setField(owner, "id", id);
        return owner;
    }

    private OAuthAccount createOAuthAccount(
            Long id, OAuthProvider provider, String providerId, Long walletId, Long ownerId) {
        OAuthAccount account =
                OAuthAccount.builder()
                        .provider(provider)
                        .providerId(providerId)
                        .email("test@example.com")
                        .name("Test User")
                        .customerWalletId(walletId)
                        .ownerAccountId(ownerId)
                        .build();
        ReflectionTestUtils.setField(account, "id", id);
        return account;
    }

    private Claims createTempClaims(String provider, String providerId, String role) {
        Claims claims = Mockito.mock(Claims.class, Mockito.withSettings().lenient());
        given(claims.get("purpose", String.class)).willReturn("oauth_signup");
        given(claims.get("provider", String.class)).willReturn(provider);
        given(claims.get("providerId", String.class)).willReturn(providerId);
        given(claims.get("role", String.class)).willReturn(role);
        given(claims.get("oauthName", String.class)).willReturn("OAuth User");
        given(claims.get("email", String.class)).willReturn("test@example.com");
        return claims;
    }

    @Nested
    @DisplayName("processOAuth2Login")
    class ProcessOAuth2LoginTest {

        @Test
        @DisplayName("신규 사용자 - CUSTOMER 역할로 회원가입 플로우 반환")
        void processOAuth2Login_NewUser_Customer_ReturnsNewUserResponse() {
            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.empty());
            given(jwtUtil.generateTempToken(any())).willReturn("temp-token");

            OAuthLoginResponse response =
                    oauthService.processOAuth2Login(
                            OAuthProvider.GOOGLE,
                            "google-123",
                            "Test User",
                            "test@example.com",
                            "CUSTOMER",
                            null);

            assertThat(response.isNewUser()).isTrue();
            assertThat(response.tempToken()).isEqualTo("temp-token");
            assertThat(response.oauthName()).isEqualTo("Test User");
            assertThat(response.oauthEmail()).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("기존 Customer 사용자 - 로그인 성공")
        void processOAuth2Login_ExistingCustomer_ReturnsTokens() {
            OAuthAccount oauthAccount =
                    createOAuthAccount(1L, OAuthProvider.GOOGLE, "google-123", 10L, null);
            CustomerWallet wallet = createWallet(10L, "01012345678", "Test", "tester");

            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.of(oauthAccount));
            given(customerWalletRepository.findById(10L)).willReturn(Optional.of(wallet));
            given(jwtUtil.generateCustomerToken(10L)).willReturn("access-token");
            given(refreshTokenService.issueCustomerRefreshToken(10L)).willReturn("refresh-token");

            OAuthLoginResponse response =
                    oauthService.processOAuth2Login(
                            OAuthProvider.GOOGLE,
                            "google-123",
                            "Test User",
                            "test@example.com",
                            "CUSTOMER",
                            null);

            assertThat(response.isNewUser()).isFalse();
            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.refreshToken()).isEqualTo("refresh-token");
            assertThat(response.id()).isEqualTo(10L);
        }

        @Test
        @DisplayName("기존 Customer가 차단된 경우 - 예외 발생")
        void processOAuth2Login_BlockedCustomer_ThrowsException() {
            OAuthAccount oauthAccount =
                    createOAuthAccount(1L, OAuthProvider.GOOGLE, "google-123", 10L, null);
            CustomerWallet wallet = createWallet(10L, "01012345678", "Test", "tester");
            ReflectionTestUtils.setField(
                    wallet,
                    "status",
                    com.project.kkookk.wallet.domain.CustomerWalletStatus.BLOCKED);

            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.of(oauthAccount));
            given(customerWalletRepository.findById(10L)).willReturn(Optional.of(wallet));

            assertThatThrownBy(
                            () ->
                                    oauthService.processOAuth2Login(
                                            OAuthProvider.GOOGLE,
                                            "google-123",
                                            "Test User",
                                            "test@example.com",
                                            "CUSTOMER",
                                            null))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CUSTOMER_WALLET_BLOCKED);
        }

        @Test
        @DisplayName("기존 Owner 사용자 - 로그인 성공")
        void processOAuth2Login_ExistingOwner_ReturnsTokens() {
            OAuthAccount oauthAccount =
                    createOAuthAccount(1L, OAuthProvider.GOOGLE, "google-123", null, 5L);
            OwnerAccount owner = createOwner(5L, "test@example.com", "Test Owner", "ownerNick");

            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.of(oauthAccount));
            given(ownerAccountRepository.findById(5L)).willReturn(Optional.of(owner));
            given(jwtUtil.generateOwnerToken(5L, "test@example.com", false))
                    .willReturn("owner-access");
            given(refreshTokenService.issueOwnerRefreshToken(5L, "test@example.com", false))
                    .willReturn("owner-refresh");

            OAuthLoginResponse response =
                    oauthService.processOAuth2Login(
                            OAuthProvider.GOOGLE,
                            "google-123",
                            "Test User",
                            "test@example.com",
                            "OWNER",
                            null);

            assertThat(response.isNewUser()).isFalse();
            assertThat(response.accessToken()).isEqualTo("owner-access");
            assertThat(response.id()).isEqualTo(5L);
        }

        @Test
        @DisplayName("크로스 역할 - Customer만 있는 계정으로 OWNER 로그인 시 newUser 반환")
        void processOAuth2Login_CrossRole_CustomerOnly_OwnerLogin_ReturnsNewUser() {
            OAuthAccount oauthAccount =
                    createOAuthAccount(1L, OAuthProvider.GOOGLE, "google-123", 10L, null);

            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.of(oauthAccount));
            given(jwtUtil.generateTempToken(any())).willReturn("temp-token-owner");

            OAuthLoginResponse response =
                    oauthService.processOAuth2Login(
                            OAuthProvider.GOOGLE,
                            "google-123",
                            "Test User",
                            "test@example.com",
                            "OWNER",
                            null);

            assertThat(response.isNewUser()).isTrue();
            assertThat(response.tempToken()).isEqualTo("temp-token-owner");
        }

        @Test
        @DisplayName("잘못된 역할 - 예외 발생")
        void processOAuth2Login_InvalidRole_ThrowsException() {
            OAuthAccount oauthAccount =
                    createOAuthAccount(1L, OAuthProvider.GOOGLE, "google-123", null, null);

            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.of(oauthAccount));

            assertThatThrownBy(
                            () ->
                                    oauthService.processOAuth2Login(
                                            OAuthProvider.GOOGLE,
                                            "google-123",
                                            "Test User",
                                            "test@example.com",
                                            "INVALID",
                                            null))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_INPUT_VALUE);
        }

        @Test
        @DisplayName("storeId가 있으면 ensureWalletStampCard 호출")
        void processOAuth2Login_WithStoreId_EnsuresWalletStampCard() {
            Long storeId = 99L;
            OAuthAccount oauthAccount =
                    createOAuthAccount(1L, OAuthProvider.GOOGLE, "google-123", 10L, null);
            CustomerWallet wallet = createWallet(10L, "01012345678", "Test", "tester");

            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.of(oauthAccount));
            given(customerWalletRepository.findById(10L)).willReturn(Optional.of(wallet));
            given(jwtUtil.generateCustomerToken(10L)).willReturn("access-token");
            given(refreshTokenService.issueCustomerRefreshToken(10L)).willReturn("refresh-token");

            oauthService.processOAuth2Login(
                    OAuthProvider.GOOGLE,
                    "google-123",
                    "Test User",
                    "test@example.com",
                    "CUSTOMER",
                    storeId);

            verify(customerWalletService).ensureWalletStampCardForStore(10L, storeId);
        }
    }

    @Nested
    @DisplayName("completeCustomerSignup")
    class CompleteCustomerSignupTest {

        @Test
        @DisplayName("신규 지갑 생성 성공")
        void completeCustomerSignup_NewWallet_Success() {
            CompleteCustomerSignupRequest request =
                    new CompleteCustomerSignupRequest(
                            "temp-token", "Test", "tester", "010-1234-5678", null);
            Claims claims = createTempClaims("GOOGLE", "google-123", "CUSTOMER");
            CustomerWallet savedWallet = createWallet(1L, "01012345678", "Test", "tester");

            given(jwtUtil.parseToken("temp-token")).willReturn(claims);
            given(customerWalletRepository.findByPhone("01012345678")).willReturn(Optional.empty());
            given(customerWalletRepository.existsByNickname("tester")).willReturn(false);
            given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.empty());
            given(oauthAccountRepository.save(any(OAuthAccount.class)))
                    .willAnswer(inv -> inv.getArgument(0));
            given(jwtUtil.generateCustomerToken(1L)).willReturn("access-token");
            given(refreshTokenService.issueCustomerRefreshToken(1L)).willReturn("refresh-token");

            OAuthLoginResponse response = oauthService.completeCustomerSignup(request);

            assertThat(response.isNewUser()).isFalse();
            assertThat(response.accessToken()).isEqualTo("access-token");
            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.phone()).isEqualTo("01012345678");
        }

        @Test
        @DisplayName("기존 지갑 연결 성공 (동일 전화번호)")
        void completeCustomerSignup_ExistingWallet_Links() {
            CompleteCustomerSignupRequest request =
                    new CompleteCustomerSignupRequest(
                            "temp-token", "Test", "tester", "010-1234-5678", null);
            Claims claims = createTempClaims("GOOGLE", "google-123", "CUSTOMER");
            CustomerWallet existingWallet =
                    createWallet(5L, "01012345678", "Existing", "existNick");

            given(jwtUtil.parseToken("temp-token")).willReturn(claims);
            given(customerWalletRepository.findByPhone("01012345678"))
                    .willReturn(Optional.of(existingWallet));
            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.empty());
            given(oauthAccountRepository.save(any(OAuthAccount.class)))
                    .willAnswer(inv -> inv.getArgument(0));
            given(jwtUtil.generateCustomerToken(5L)).willReturn("access-token");
            given(refreshTokenService.issueCustomerRefreshToken(5L)).willReturn("refresh-token");

            OAuthLoginResponse response = oauthService.completeCustomerSignup(request);

            assertThat(response.id()).isEqualTo(5L);
            verify(customerWalletRepository, never()).save(any());
        }

        @Test
        @DisplayName("닉네임 중복 - 예외 발생")
        void completeCustomerSignup_DuplicateNickname_ThrowsException() {
            CompleteCustomerSignupRequest request =
                    new CompleteCustomerSignupRequest(
                            "temp-token", "Test", "dupNick", "010-9999-0000", null);
            Claims claims = createTempClaims("GOOGLE", "google-123", "CUSTOMER");

            given(jwtUtil.parseToken("temp-token")).willReturn(claims);
            given(customerWalletRepository.findByPhone("01099990000")).willReturn(Optional.empty());
            given(customerWalletRepository.existsByNickname("dupNick")).willReturn(true);

            assertThatThrownBy(() -> oauthService.completeCustomerSignup(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WALLET_NICKNAME_DUPLICATED);
        }

        @Test
        @DisplayName("storeId 제공 시 ensureWalletStampCardForStore 호출")
        void completeCustomerSignup_WithStoreId_EnsuresCard() {
            CompleteCustomerSignupRequest request =
                    new CompleteCustomerSignupRequest(
                            "temp-token", "Test", "tester", "010-1234-5678", 50L);
            Claims claims = createTempClaims("GOOGLE", "google-123", "CUSTOMER");
            CustomerWallet wallet = createWallet(1L, "01012345678", "Test", "tester");

            given(jwtUtil.parseToken("temp-token")).willReturn(claims);
            given(customerWalletRepository.findByPhone("01012345678")).willReturn(Optional.empty());
            given(customerWalletRepository.existsByNickname("tester")).willReturn(false);
            given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(wallet);
            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.empty());
            given(oauthAccountRepository.save(any(OAuthAccount.class)))
                    .willAnswer(inv -> inv.getArgument(0));
            given(jwtUtil.generateCustomerToken(1L)).willReturn("access-token");
            given(refreshTokenService.issueCustomerRefreshToken(1L)).willReturn("refresh-token");

            oauthService.completeCustomerSignup(request);

            verify(customerWalletService).ensureWalletStampCardForStore(1L, 50L);
        }
    }

    @Nested
    @DisplayName("completeOwnerSignup")
    class CompleteOwnerSignupTest {

        @Test
        @DisplayName("신규 Owner 생성 성공")
        void completeOwnerSignup_NewOwner_Success() {
            CompleteOwnerSignupRequest request =
                    new CompleteOwnerSignupRequest(
                            "temp-token", "Owner", "ownerNick", "010-5555-6666");
            Claims claims = createTempClaims("GOOGLE", "google-123", "OWNER");
            OwnerAccount savedOwner = createOwner(1L, "test@example.com", "Owner", "ownerNick");

            given(jwtUtil.parseToken("temp-token")).willReturn(claims);
            given(ownerAccountRepository.findByEmail("test@example.com"))
                    .willReturn(Optional.empty());
            given(ownerAccountRepository.save(any(OwnerAccount.class))).willReturn(savedOwner);
            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.empty());
            given(oauthAccountRepository.save(any(OAuthAccount.class)))
                    .willAnswer(inv -> inv.getArgument(0));
            given(jwtUtil.generateOwnerToken(1L, "test@example.com", false))
                    .willReturn("owner-access");
            given(refreshTokenService.issueOwnerRefreshToken(1L, "test@example.com", false))
                    .willReturn("owner-refresh");

            OAuthLoginResponse response = oauthService.completeOwnerSignup(request);

            assertThat(response.isNewUser()).isFalse();
            assertThat(response.accessToken()).isEqualTo("owner-access");
            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.email()).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("기존 Owner 연결 성공 (동일 이메일)")
        void completeOwnerSignup_ExistingOwner_Links() {
            CompleteOwnerSignupRequest request =
                    new CompleteOwnerSignupRequest(
                            "temp-token", "Owner", "ownerNick", "010-5555-6666");
            Claims claims = createTempClaims("GOOGLE", "google-123", "OWNER");
            OwnerAccount existingOwner =
                    createOwner(7L, "test@example.com", "Existing Owner", "existOwner");

            given(jwtUtil.parseToken("temp-token")).willReturn(claims);
            given(ownerAccountRepository.findByEmail("test@example.com"))
                    .willReturn(Optional.of(existingOwner));
            given(
                            oauthAccountRepository.findByProviderAndProviderId(
                                    OAuthProvider.GOOGLE, "google-123"))
                    .willReturn(Optional.empty());
            given(oauthAccountRepository.save(any(OAuthAccount.class)))
                    .willAnswer(inv -> inv.getArgument(0));
            given(jwtUtil.generateOwnerToken(7L, "test@example.com", false))
                    .willReturn("owner-access");
            given(refreshTokenService.issueOwnerRefreshToken(7L, "test@example.com", false))
                    .willReturn("owner-refresh");

            OAuthLoginResponse response = oauthService.completeOwnerSignup(request);

            assertThat(response.id()).isEqualTo(7L);
            verify(ownerAccountRepository, never()).save(any());
        }

        @Test
        @DisplayName("유효하지 않은 tempToken - 예외 발생")
        void completeOwnerSignup_InvalidTempToken_ThrowsException() {
            CompleteOwnerSignupRequest request =
                    new CompleteOwnerSignupRequest(
                            "invalid-token", "Owner", "ownerNick", "010-5555-6666");

            given(jwtUtil.parseToken("invalid-token"))
                    .willThrow(new RuntimeException("Invalid token"));

            assertThatThrownBy(() -> oauthService.completeOwnerSignup(request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OAUTH_INVALID_TEMP_TOKEN);
        }
    }
}
