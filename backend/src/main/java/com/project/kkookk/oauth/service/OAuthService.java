package com.project.kkookk.oauth.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.oauth.controller.dto.CompleteCustomerSignupRequest;
import com.project.kkookk.oauth.controller.dto.CompleteOwnerSignupRequest;
import com.project.kkookk.oauth.controller.dto.OAuthLoginRequest;
import com.project.kkookk.oauth.controller.dto.OAuthLoginResponse;
import com.project.kkookk.oauth.controller.dto.TerminalSelectRequest;
import com.project.kkookk.oauth.domain.OAuthAccount;
import com.project.kkookk.oauth.domain.OAuthProvider;
import com.project.kkookk.oauth.repository.OAuthAccountRepository;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.service.CustomerWalletService;
import io.jsonwebtoken.Claims;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class OAuthService {

    private final OAuthAccountRepository oauthAccountRepository;
    private final OwnerAccountRepository ownerAccountRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final StoreRepository storeRepository;
    private final CustomerWalletService customerWalletService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final Map<OAuthProvider, OAuthProviderClient> providerClients;

    public OAuthService(
            OAuthAccountRepository oauthAccountRepository,
            OwnerAccountRepository ownerAccountRepository,
            CustomerWalletRepository customerWalletRepository,
            StoreRepository storeRepository,
            CustomerWalletService customerWalletService,
            JwtUtil jwtUtil,
            RefreshTokenService refreshTokenService,
            GoogleOAuthClient googleOAuthClient,
            KakaoOAuthClient kakaoOAuthClient,
            NaverOAuthClient naverOAuthClient) {
        this.oauthAccountRepository = oauthAccountRepository;
        this.ownerAccountRepository = ownerAccountRepository;
        this.customerWalletRepository = customerWalletRepository;
        this.storeRepository = storeRepository;
        this.customerWalletService = customerWalletService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.providerClients =
                Map.of(
                        OAuthProvider.GOOGLE, googleOAuthClient,
                        OAuthProvider.KAKAO, kakaoOAuthClient,
                        OAuthProvider.NAVER, naverOAuthClient);
    }

    @Transactional
    public OAuthLoginResponse login(OAuthLoginRequest request) {
        OAuthProviderClient client = providerClients.get(request.provider());
        OAuthUserInfo userInfo = client.getUserInfo(request.code(), request.redirectUri());

        Optional<OAuthAccount> existing =
                oauthAccountRepository.findByProviderAndProviderId(
                        request.provider(), userInfo.id());

        String role = request.role().toUpperCase();

        if (existing.isPresent()) {
            return handleExistingUser(existing.get(), role, request.storeId());
        } else {
            return handleNewUser(userInfo, request.provider(), role);
        }
    }

    @Transactional
    public OAuthLoginResponse completeCustomerSignup(CompleteCustomerSignupRequest request) {
        Claims claims = validateTempToken(request.tempToken());
        String providerId = claims.get("providerId", String.class);
        OAuthProvider provider = OAuthProvider.valueOf(claims.get("provider", String.class));

        String phone = request.phone().replaceAll("[^0-9]", "");

        // Check duplicates
        if (customerWalletRepository.existsByPhone(phone)) {
            throw new BusinessException(ErrorCode.WALLET_PHONE_DUPLICATED);
        }
        if (customerWalletRepository.existsByNickname(request.nickname())) {
            throw new BusinessException(ErrorCode.WALLET_NICKNAME_DUPLICATED);
        }

        // Create CustomerWallet
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone(phone)
                        .name(request.name())
                        .nickname(request.nickname())
                        .build();
        CustomerWallet savedWallet = customerWalletRepository.save(wallet);

        // Link or create OAuthAccount for wallet
        String email = claims.get("email", String.class);
        String oauthName = claims.get("oauthName", String.class);
        OAuthAccount oauthAccount =
                oauthAccountRepository
                        .findByProviderAndProviderId(provider, providerId)
                        .orElseGet(
                                () ->
                                        OAuthAccount.builder()
                                                .provider(provider)
                                                .providerId(providerId)
                                                .email(email)
                                                .name(oauthName)
                                                .build());
        oauthAccount.linkCustomer(savedWallet.getId());
        oauthAccountRepository.save(oauthAccount);

        // Auto-create stamp card if storeId provided
        if (request.storeId() != null) {
            customerWalletService.ensureWalletStampCardForStore(
                    savedWallet.getId(), request.storeId());
        }

        // Generate tokens
        String accessToken = jwtUtil.generateCustomerToken(savedWallet.getId());
        String refreshToken = refreshTokenService.issueCustomerRefreshToken(savedWallet.getId());

        log.info(
                "[OAuth Customer Signup] walletId={}, provider={}, storeId={}",
                savedWallet.getId(),
                provider,
                request.storeId());

        return OAuthLoginResponse.existingCustomer(
                accessToken,
                refreshToken,
                savedWallet.getId(),
                savedWallet.getName(),
                savedWallet.getNickname(),
                savedWallet.getPhone());
    }

    @Transactional
    public OAuthLoginResponse completeOwnerSignup(CompleteOwnerSignupRequest request) {
        Claims claims = validateTempToken(request.tempToken());
        String providerId = claims.get("providerId", String.class);
        OAuthProvider provider = OAuthProvider.valueOf(claims.get("provider", String.class));

        // Create OwnerAccount (no password, OAuth only)
        String email = claims.get("email", String.class);
        OwnerAccount owner =
                OwnerAccount.builder()
                        .email(email)
                        .name(request.name())
                        .nickname(request.nickname())
                        .phoneNumber(request.phone().replaceAll("[^0-9]", ""))
                        .build();
        OwnerAccount savedOwner = ownerAccountRepository.save(owner);

        // Link or create OAuthAccount for owner
        String oauthName = claims.get("oauthName", String.class);
        OAuthAccount oauthAccount =
                oauthAccountRepository
                        .findByProviderAndProviderId(provider, providerId)
                        .orElseGet(
                                () ->
                                        OAuthAccount.builder()
                                                .provider(provider)
                                                .providerId(providerId)
                                                .email(email)
                                                .name(oauthName)
                                                .build());
        oauthAccount.linkOwner(savedOwner.getId());
        oauthAccountRepository.save(oauthAccount);

        // Generate tokens
        String accessToken =
                jwtUtil.generateOwnerToken(savedOwner.getId(), email, savedOwner.isAdmin());
        String refreshToken =
                refreshTokenService.issueOwnerRefreshToken(
                        savedOwner.getId(), email, savedOwner.isAdmin());

        log.info("[OAuth Owner Signup] ownerId={}, provider={}", savedOwner.getId(), provider);

        return OAuthLoginResponse.existingOwner(
                accessToken,
                refreshToken,
                savedOwner.getId(),
                savedOwner.getName(),
                savedOwner.getNickname(),
                savedOwner.getEmail(),
                savedOwner.getPhoneNumber());
    }

    @Transactional
    public OAuthLoginResponse terminalSelect(TerminalSelectRequest request) {
        Claims claims = validateTempToken(request.tempToken());
        Long ownerId = Long.parseLong(claims.get("ownerId", String.class));

        OwnerAccount owner =
                ownerAccountRepository
                        .findById(ownerId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.OAUTH_OWNER_NOT_FOUND));

        Store store =
                storeRepository
                        .findByIdAndOwnerAccountId(request.storeId(), ownerId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        if (!store.isLive()) {
            throw new BusinessException(ErrorCode.STORE_NOT_OPERATIONAL);
        }

        String accessToken = jwtUtil.generateOwnerToken(ownerId, owner.getEmail(), owner.isAdmin());
        String refreshToken =
                refreshTokenService.issueOwnerRefreshToken(
                        ownerId, owner.getEmail(), owner.isAdmin());

        log.info("[OAuth Terminal Select] ownerId={}, storeId={}", ownerId, store.getId());

        return new OAuthLoginResponse(
                false,
                null,
                null,
                null,
                accessToken,
                refreshToken,
                null,
                null,
                null,
                null,
                null,
                null,
                null);
    }

    private OAuthLoginResponse handleExistingUser(
            OAuthAccount oauthAccount, String role, Long storeId) {

        return switch (role) {
            case "CUSTOMER" -> handleExistingCustomer(oauthAccount, storeId);
            case "OWNER" -> handleExistingOwner(oauthAccount);
            case "TERMINAL" -> handleExistingTerminal(oauthAccount);
            default -> throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        };
    }

    private OAuthLoginResponse handleExistingCustomer(OAuthAccount oauthAccount, Long storeId) {
        if (oauthAccount.getCustomerWalletId() == null) {
            // Owner로만 등록된 OAuth 계정 → Customer 회원가입 플로우
            OAuthUserInfo userInfo =
                    new OAuthUserInfo(
                            oauthAccount.getProviderId(),
                            oauthAccount.getName(),
                            oauthAccount.getEmail());
            String tempToken = generateTempToken(userInfo, oauthAccount.getProvider(), "CUSTOMER");
            return OAuthLoginResponse.newUser(tempToken, oauthAccount.getName(), oauthAccount.getEmail());
        }

        CustomerWallet wallet =
                customerWalletRepository
                        .findById(oauthAccount.getCustomerWalletId())
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.CUSTOMER_WALLET_NOT_FOUND));

        if (wallet.isBlocked()) {
            throw new BusinessException(ErrorCode.CUSTOMER_WALLET_BLOCKED);
        }

        if (storeId != null) {
            customerWalletService.ensureWalletStampCardForStore(wallet.getId(), storeId);
        }

        String accessToken = jwtUtil.generateCustomerToken(wallet.getId());
        String refreshToken = refreshTokenService.issueCustomerRefreshToken(wallet.getId());

        log.info(
                "[OAuth Customer Login] walletId={}, provider={}",
                wallet.getId(),
                oauthAccount.getProvider());

        return OAuthLoginResponse.existingCustomer(
                accessToken,
                refreshToken,
                wallet.getId(),
                wallet.getName(),
                wallet.getNickname(),
                wallet.getPhone());
    }

    private OAuthLoginResponse handleExistingOwner(OAuthAccount oauthAccount) {
        if (oauthAccount.getOwnerAccountId() == null) {
            // Customer로만 등록된 OAuth 계정 → Owner 회원가입 플로우
            OAuthUserInfo userInfo =
                    new OAuthUserInfo(
                            oauthAccount.getProviderId(),
                            oauthAccount.getName(),
                            oauthAccount.getEmail());
            String tempToken = generateTempToken(userInfo, oauthAccount.getProvider(), "OWNER");
            return OAuthLoginResponse.newUser(tempToken, oauthAccount.getName(), oauthAccount.getEmail());
        }

        OwnerAccount owner =
                ownerAccountRepository
                        .findById(oauthAccount.getOwnerAccountId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.OAUTH_OWNER_NOT_FOUND));

        String accessToken =
                jwtUtil.generateOwnerToken(owner.getId(), owner.getEmail(), owner.isAdmin());
        String refreshToken =
                refreshTokenService.issueOwnerRefreshToken(
                        owner.getId(), owner.getEmail(), owner.isAdmin());

        log.info(
                "[OAuth Owner Login] ownerId={}, provider={}",
                owner.getId(),
                oauthAccount.getProvider());

        return OAuthLoginResponse.existingOwner(
                accessToken,
                refreshToken,
                owner.getId(),
                owner.getName(),
                owner.getNickname(),
                owner.getEmail(),
                owner.getPhoneNumber());
    }

    private OAuthLoginResponse handleExistingTerminal(OAuthAccount oauthAccount) {
        if (oauthAccount.getOwnerAccountId() == null) {
            return OAuthLoginResponse.terminalOwnerNotFound();
        }

        Long ownerId = oauthAccount.getOwnerAccountId();
        List<Store> stores =
                storeRepository.findByOwnerAccountIdAndStatusNot(ownerId, StoreStatus.DELETED);

        if (stores.isEmpty()) {
            return OAuthLoginResponse.terminalOwnerNotFound();
        }

        String tempToken = generateTerminalTempToken(ownerId);
        List<OAuthLoginResponse.StoreItem> storeItems =
                stores.stream()
                        .map(s -> new OAuthLoginResponse.StoreItem(s.getId(), s.getName()))
                        .toList();

        return OAuthLoginResponse.terminalOwnerFound(tempToken, ownerId, storeItems);
    }

    private OAuthLoginResponse handleNewUser(
            OAuthUserInfo userInfo, OAuthProvider provider, String role) {

        if ("TERMINAL".equals(role)) {
            return OAuthLoginResponse.terminalOwnerNotFound();
        }

        String tempToken = generateTempToken(userInfo, provider, role);
        return OAuthLoginResponse.newUser(tempToken, userInfo.name(), userInfo.email());
    }

    private String generateTempToken(OAuthUserInfo userInfo, OAuthProvider provider, String role) {
        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("purpose", "oauth_signup");
        claims.put("provider", provider.name());
        claims.put("providerId", userInfo.id());
        claims.put("role", role);
        if (userInfo.name() != null) {
            claims.put("oauthName", userInfo.name());
        }
        if (userInfo.email() != null) {
            claims.put("email", userInfo.email());
        }

        return jwtUtil.generateTempToken(claims);
    }

    private String generateTerminalTempToken(Long ownerId) {
        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("purpose", "terminal_select");
        claims.put("ownerId", String.valueOf(ownerId));

        return jwtUtil.generateTempToken(claims);
    }

    private Claims validateTempToken(String tempToken) {
        try {
            Claims claims = jwtUtil.parseToken(tempToken);
            String purpose = claims.get("purpose", String.class);
            if (purpose == null) {
                throw new BusinessException(ErrorCode.OAUTH_INVALID_TEMP_TOKEN);
            }
            return claims;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.OAUTH_INVALID_TEMP_TOKEN);
        }
    }
}
