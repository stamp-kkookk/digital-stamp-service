package com.project.kkookk.oauth.service;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class OAuthService {

    private final OAuthAccountRepository oauthAccountRepository;
    private final OwnerAccountRepository ownerAccountRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final CustomerWalletService customerWalletService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public OAuthLoginResponse processOAuth2Login(
            OAuthProvider provider,
            String providerId,
            String name,
            String email,
            String role,
            Long storeId) {

        String normalizedRole = role.toUpperCase();

        Optional<OAuthAccount> existing =
                oauthAccountRepository.findByProviderAndProviderId(provider, providerId);

        if (existing.isPresent()) {
            return handleExistingUser(existing.get(), normalizedRole, storeId);
        } else {
            return handleNewUser(provider, providerId, name, email, normalizedRole, storeId);
        }
    }

    @Transactional
    public OAuthLoginResponse completeCustomerSignup(CompleteCustomerSignupRequest request) {
        Claims claims = validateTempToken(request.tempToken());
        String providerId = claims.get("providerId", String.class);
        OAuthProvider provider = OAuthProvider.valueOf(claims.get("provider", String.class));

        String phone = request.phone().replaceAll("[^0-9]", "");

        // Check if wallet already exists with this phone (link existing)
        Optional<CustomerWallet> existingWallet = customerWalletRepository.findByPhone(phone);
        CustomerWallet wallet;
        if (existingWallet.isPresent()) {
            wallet = existingWallet.get();
        } else {
            // Check duplicates for new wallet
            if (customerWalletRepository.existsByNickname(request.nickname())) {
                throw new BusinessException(ErrorCode.WALLET_NICKNAME_DUPLICATED);
            }

            wallet =
                    CustomerWallet.builder()
                            .phone(phone)
                            .name(request.name())
                            .nickname(request.nickname())
                            .build();
            wallet = customerWalletRepository.save(wallet);
        }

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
        if (oauthAccount.getCustomerWalletId() == null) {
            oauthAccount.linkCustomer(wallet.getId());
        }
        oauthAccountRepository.save(oauthAccount);

        // Auto-create stamp card if storeId provided
        if (request.storeId() != null) {
            customerWalletService.ensureWalletStampCardForStore(wallet.getId(), request.storeId());
        }

        // Generate tokens
        String accessToken = jwtUtil.generateCustomerToken(wallet.getId());
        String refreshToken = refreshTokenService.issueCustomerRefreshToken(wallet.getId());

        log.info(
                "[OAuth Customer Signup] walletId={}, provider={}, storeId={}",
                wallet.getId(),
                provider,
                request.storeId());

        return OAuthLoginResponse.existingCustomer(
                accessToken,
                refreshToken,
                wallet.getId(),
                wallet.getName(),
                wallet.getNickname(),
                wallet.getPhone());
    }

    @Transactional
    public OAuthLoginResponse completeOwnerSignup(CompleteOwnerSignupRequest request) {
        Claims claims = validateTempToken(request.tempToken());
        String providerId = claims.get("providerId", String.class);
        OAuthProvider provider = OAuthProvider.valueOf(claims.get("provider", String.class));

        String email = claims.get("email", String.class);

        // Check if owner already exists with this email (link existing)
        Optional<OwnerAccount> existingOwner = ownerAccountRepository.findByEmail(email);
        OwnerAccount owner;
        if (existingOwner.isPresent()) {
            owner = existingOwner.get();
        } else {
            String nickname =
                    (request.nickname() != null && !request.nickname().isBlank())
                            ? request.nickname()
                            : request.name();
            owner =
                    OwnerAccount.builder()
                            .email(email)
                            .name(request.name())
                            .nickname(nickname)
                            .phoneNumber(request.phone().replaceAll("[^0-9]", ""))
                            .build();
            owner = ownerAccountRepository.save(owner);
        }

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
        if (oauthAccount.getOwnerAccountId() == null) {
            oauthAccount.linkOwner(owner.getId());
        }
        oauthAccountRepository.save(oauthAccount);

        // Generate tokens
        String accessToken = jwtUtil.generateOwnerToken(owner.getId(), email, owner.isAdmin());
        String refreshToken =
                refreshTokenService.issueOwnerRefreshToken(owner.getId(), email, owner.isAdmin());

        log.info("[OAuth Owner Signup] ownerId={}, provider={}", owner.getId(), provider);

        return OAuthLoginResponse.existingOwner(
                accessToken,
                refreshToken,
                owner.getId(),
                owner.getName(),
                owner.getNickname(),
                owner.getEmail(),
                owner.getPhoneNumber());
    }

    private OAuthLoginResponse handleExistingUser(
            OAuthAccount oauthAccount, String role, Long storeId) {

        return switch (role) {
            case "CUSTOMER" -> handleExistingCustomer(oauthAccount, storeId);
            case "OWNER" -> handleExistingOwner(oauthAccount);
            default -> throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE);
        };
    }

    private OAuthLoginResponse handleExistingCustomer(OAuthAccount oauthAccount, Long storeId) {
        if (oauthAccount.getCustomerWalletId() == null) {
            // Owner로만 등록된 OAuth 계정 → Customer 회원가입 플로우
            String tempToken =
                    generateTempToken(
                            oauthAccount.getProviderId(),
                            oauthAccount.getName(),
                            oauthAccount.getEmail(),
                            oauthAccount.getProvider(),
                            "CUSTOMER",
                            storeId);
            return OAuthLoginResponse.newUser(
                    tempToken, oauthAccount.getName(), oauthAccount.getEmail());
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
            String tempToken =
                    generateTempToken(
                            oauthAccount.getProviderId(),
                            oauthAccount.getName(),
                            oauthAccount.getEmail(),
                            oauthAccount.getProvider(),
                            "OWNER",
                            null);
            return OAuthLoginResponse.newUser(
                    tempToken, oauthAccount.getName(), oauthAccount.getEmail());
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

    private OAuthLoginResponse handleNewUser(
            OAuthProvider provider,
            String providerId,
            String name,
            String email,
            String role,
            Long storeId) {

        String tempToken = generateTempToken(providerId, name, email, provider, role, storeId);
        return OAuthLoginResponse.newUser(tempToken, name, email);
    }

    private String generateTempToken(
            String providerId,
            String name,
            String email,
            OAuthProvider provider,
            String role,
            Long storeId) {
        java.util.HashMap<String, Object> claims = new java.util.HashMap<>();
        claims.put("purpose", "oauth_signup");
        claims.put("provider", provider.name());
        claims.put("providerId", providerId);
        claims.put("role", role);
        if (name != null) {
            claims.put("oauthName", name);
        }
        if (email != null) {
            claims.put("email", email);
        }
        if (storeId != null) {
            claims.put("storeId", storeId);
        }

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
