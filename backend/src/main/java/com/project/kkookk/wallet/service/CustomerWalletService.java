package com.project.kkookk.wallet.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
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
}
