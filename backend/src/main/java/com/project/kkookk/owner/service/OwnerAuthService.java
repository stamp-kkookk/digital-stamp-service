package com.project.kkookk.owner.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.owner.controller.dto.OwnerLoginRequest;
import com.project.kkookk.owner.controller.dto.OwnerLoginResponse;
import com.project.kkookk.owner.controller.dto.OwnerSignupRequest;
import com.project.kkookk.owner.controller.dto.OwnerSignupResponse;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerAuthService {

    private final OwnerAccountRepository ownerAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public OwnerSignupResponse signup(OwnerSignupRequest request) {
        validateEmailNotDuplicated(request.email());

        String normalizedPhone = request.phoneNumber().replaceAll("[^0-9]", "");

        OwnerAccount ownerAccount =
                OwnerAccount.builder()
                        .email(request.email())
                        .passwordHash(passwordEncoder.encode(request.password()))
                        .name(request.name())
                        .phoneNumber(normalizedPhone)
                        .build();

        OwnerAccount savedOwnerAccount = ownerAccountRepository.save(ownerAccount);
        log.info("[Auth] Owner signup email={}", request.email());

        return OwnerSignupResponse.from(savedOwnerAccount);
    }

    @Transactional
    public OwnerLoginResponse login(OwnerLoginRequest request) {
        OwnerAccount ownerAccount =
                ownerAccountRepository
                        .findByEmail(request.email())
                        .orElseThrow(() -> new BusinessException(ErrorCode.OWNER_LOGIN_FAILED));

        if (!passwordEncoder.matches(request.password(), ownerAccount.getPasswordHash())) {
            log.warn("[Auth] Owner login failed email={}", request.email());
            throw new BusinessException(ErrorCode.OWNER_LOGIN_FAILED);
        }

        String accessToken =
                jwtUtil.generateOwnerToken(
                        ownerAccount.getId(), ownerAccount.getEmail(), ownerAccount.isAdmin());
        String refreshToken =
                refreshTokenService.issueOwnerRefreshToken(
                        ownerAccount.getId(), ownerAccount.getEmail(), ownerAccount.isAdmin());
        log.info("[Auth] Owner login success ownerId={}", ownerAccount.getId());

        return OwnerLoginResponse.of(accessToken, refreshToken, ownerAccount);
    }

    private void validateEmailNotDuplicated(String email) {
        if (ownerAccountRepository.existsByEmail(email)) {
            throw new BusinessException(ErrorCode.OWNER_EMAIL_DUPLICATED);
        }
    }
}
