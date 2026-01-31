package com.project.kkookk.wallet.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.dto.WalletAccessRequest;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerWalletService {

    private final CustomerWalletRepository customerWalletRepository;
    private final JwtUtil jwtUtil;

    // Rate Limiting: In-Memory Store (MVP)
    private final ConcurrentHashMap<String, LocalDateTime> rateLimitStore =
            new ConcurrentHashMap<>();
    private static final int RATE_LIMIT_SECONDS = 60;

    @Transactional
    public WalletRegisterResponse register(WalletRegisterRequest request) {
        // 1. 전화번호 중복 체크
        if (customerWalletRepository.existsByPhone(request.phone())) {
            throw new BusinessException(ErrorCode.WALLET_PHONE_DUPLICATED);
        }

        // 2. CustomerWallet 생성
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone(request.phone())
                        .name(request.name())
                        .nickname(request.nickname())
                        .build();

        CustomerWallet savedWallet = customerWalletRepository.save(wallet);

        // 3. JWT 토큰 생성
        String accessToken =
                jwtUtil.generateCustomerAccessToken(savedWallet.getId(), savedWallet.getPhone());

        log.info(
                "[Wallet Register] walletId={}, phone={}, name={}",
                savedWallet.getId(),
                savedWallet.getPhone(),
                savedWallet.getName());

        // 4. Response 반환
        return new WalletRegisterResponse(
                accessToken,
                savedWallet.getId(),
                savedWallet.getPhone(),
                savedWallet.getName(),
                savedWallet.getNickname());
    }

    public WalletAccessResponse accessWallet(WalletAccessRequest request) {
        // 1. Phone 정규화 (하이픈 제거)
        String normalizedPhone = request.phone().replaceAll("-", "");

        // 2. Rate Limit 체크 (정규화된 phone 기준)
        checkRateLimit(normalizedPhone);

        // 3. DB 조회: 먼저 요청 phone으로 시도, 실패 시 정규화된 phone으로 재시도
        Optional<CustomerWallet> walletOpt = customerWalletRepository.findByPhone(request.phone());
        if (walletOpt.isEmpty()) {
            walletOpt = customerWalletRepository.findByPhone(normalizedPhone);
        }

        CustomerWallet wallet =
                walletOpt.orElseThrow(() -> new BusinessException(ErrorCode.WALLET_NOT_FOUND));

        // 4. Name 검증 (대소문자 무시)
        if (!wallet.getName().equalsIgnoreCase(request.name())) {
            throw new BusinessException(ErrorCode.WALLET_NOT_FOUND);
        }

        // 5. Status 검증 (BLOCKED 상태 체크)
        if (wallet.isBlocked()) {
            throw new BusinessException(ErrorCode.WALLET_BLOCKED);
        }

        // 6. Rate Limit 타임스탬프 저장 (정규화된 phone 기준)
        rateLimitStore.put(normalizedPhone, LocalDateTime.now());

        log.info(
                "[Wallet Access] walletId={}, phone={}, name={}",
                wallet.getId(),
                wallet.getPhone(),
                wallet.getName());

        // 7. Response 반환
        return new WalletAccessResponse(
                wallet.getId(), wallet.getPhone(), wallet.getName(), wallet.getNickname());
    }

    private void checkRateLimit(String normalizedPhone) {
        LocalDateTime lastAccessTime = rateLimitStore.get(normalizedPhone);
        if (lastAccessTime != null
                && LocalDateTime.now()
                        .isBefore(lastAccessTime.plusSeconds(RATE_LIMIT_SECONDS))) {
            throw new BusinessException(ErrorCode.WALLET_ACCESS_RATE_LIMIT_EXCEEDED);
        }
    }
}
