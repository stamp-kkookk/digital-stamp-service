package com.kkookk.customer.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.dto.AccessWalletRequest;
import com.kkookk.customer.dto.RegisterWalletRequest;
import com.kkookk.customer.dto.WalletResponse;
import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.customer.entity.SessionScope;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.customer.repository.CustomerWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private static final int SESSION_EXPIRATION_HOURS = 24;

    private final CustomerWalletRepository walletRepository;
    private final CustomerSessionRepository sessionRepository;
    private final OtpService otpService;

    @Transactional
    public WalletResponse registerWallet(RegisterWalletRequest request) {
        // OTP 검증
        otpService.verifyOtp(request.getPhoneNumber(), request.getOtpCode());

        // 이미 등록된 전화번호인지 확인
        if (walletRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException(
                    "W001",
                    "이미 등록된 전화번호입니다.",
                    HttpStatus.CONFLICT
            );
        }

        // Wallet 생성
        CustomerWallet wallet = CustomerWallet.builder()
                .phoneNumber(request.getPhoneNumber())
                .name(request.getName())
                .nickname(request.getNickname())
                .build();

        wallet = walletRepository.save(wallet);

        // FULL 권한 세션 생성
        CustomerSession session = createSession(wallet, SessionScope.FULL);

        log.info("New wallet registered: {}", wallet.getId());

        return WalletResponse.builder()
                .walletId(wallet.getId())
                .phoneNumber(wallet.getPhoneNumber())
                .name(wallet.getName())
                .nickname(wallet.getNickname())
                .sessionToken(session.getSessionToken())
                .sessionScope(session.getScope().name())
                .build();
    }

    @Transactional
    public WalletResponse accessWallet(AccessWalletRequest request) {
        // Wallet 조회 (전화번호 + 이름 확인)
        CustomerWallet wallet = walletRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new BusinessException(
                        "W002",
                        "등록되지 않은 전화번호입니다.",
                        HttpStatus.NOT_FOUND
                ));

        if (!wallet.getName().equals(request.getName())) {
            throw new BusinessException(
                    "W003",
                    "이름이 일치하지 않습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        // VIEW 권한 세션 생성
        CustomerSession session = createSession(wallet, SessionScope.VIEW);

        log.info("Wallet access granted (VIEW scope): {}", wallet.getId());

        return WalletResponse.builder()
                .walletId(wallet.getId())
                .phoneNumber(wallet.getPhoneNumber())
                .name(wallet.getName())
                .nickname(wallet.getNickname())
                .sessionToken(session.getSessionToken())
                .sessionScope(session.getScope().name())
                .build();
    }

    private CustomerSession createSession(CustomerWallet wallet, SessionScope scope) {
        String sessionToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(SESSION_EXPIRATION_HOURS);

        CustomerSession session = CustomerSession.builder()
                .wallet(wallet)
                .sessionToken(sessionToken)
                .scope(scope)
                .expiresAt(expiresAt)
                .build();

        return sessionRepository.save(session);
    }
}
