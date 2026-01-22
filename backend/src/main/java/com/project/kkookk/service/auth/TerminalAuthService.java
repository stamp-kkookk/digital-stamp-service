package com.project.kkookk.service.auth;

import com.project.kkookk.domain.owner.OwnerAccount;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.domain.store.StoreStatus;
import com.project.kkookk.dto.auth.TerminalLoginRequest;
import com.project.kkookk.dto.auth.TerminalLoginResponse;
import com.project.kkookk.global.security.JwtProvider;
import com.project.kkookk.repository.owner.OwnerAccountRepository;
import com.project.kkookk.repository.store.StoreRepository;
import java.util.List;
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
    private final JwtProvider jwtProvider;

    public TerminalLoginResponse login(TerminalLoginRequest request) {
        // 1. Owner 계정 조회
        OwnerAccount owner = ownerAccountRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(request.password(), owner.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // 3. Active Store 조회
        List<Store> activeStores = storeRepository.findByOwnerAccountIdAndStatus(owner.getId(), StoreStatus.ACTIVE);
        if (activeStores.isEmpty()) {
            throw new IllegalArgumentException("No active store found for this account");
        }

        // MVP: 첫 번째 Active Store 선택
        Store store = activeStores.get(0);

        // 4. 토큰 발급
        String accessToken = jwtProvider.createAccessToken(owner.getId(), "TERMINAL", store.getId());
        String refreshToken = jwtProvider.createRefreshToken(owner.getId());

        // 5. Audit Logging
        log.info("Audit:Action=TERMINAL_LOGIN, StoreId={}, OwnerId={}, Result=SUCCESS", store.getId(), owner.getId());

        return new TerminalLoginResponse(
            accessToken,
            refreshToken,
            store.getId(),
            store.getName()
        );
    }
}
