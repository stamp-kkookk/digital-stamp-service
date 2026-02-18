package com.project.kkookk.terminal.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.terminal.controller.dto.TerminalLoginRequest;
import com.project.kkookk.terminal.controller.dto.TerminalLoginResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TerminalAuthService {

    private final OwnerAccountRepository ownerAccountRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public TerminalLoginResponse login(TerminalLoginRequest request) {
        // 1. Owner 인증
        OwnerAccount owner =
                ownerAccountRepository
                        .findByEmail(request.email())
                        .orElseThrow(() -> new BusinessException(ErrorCode.OWNER_LOGIN_FAILED));

        if (!passwordEncoder.matches(request.password(), owner.getPasswordHash())) {
            log.warn(
                    "[Auth] Terminal login failed storeId={} reason=invalid_password",
                    request.storeId());
            throw new BusinessException(ErrorCode.OWNER_LOGIN_FAILED);
        }

        // 2. 매장 소유권 확인
        Store store =
                storeRepository
                        .findByIdAndOwnerAccountId(request.storeId(), owner.getId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.TERMINAL_ACCESS_DENIED));

        // 3. 매장 운영 상태 확인
        if (!store.getStatus().isOperational()) {
            throw new BusinessException(ErrorCode.STORE_INACTIVE);
        }

        // 4. Terminal 토큰 발급
        String accessToken =
                jwtUtil.generateTerminalToken(owner.getId(), owner.getEmail(), store.getId());
        String refreshToken =
                refreshTokenService.issueTerminalRefreshToken(
                        owner.getId(), owner.getEmail(), store.getId());

        log.info(
                "[Terminal Login] ownerId={}, storeId={}, storeName={}",
                owner.getId(),
                store.getId(),
                store.getName());

        return TerminalLoginResponse.of(accessToken, refreshToken, owner.getId(), store);
    }
}
