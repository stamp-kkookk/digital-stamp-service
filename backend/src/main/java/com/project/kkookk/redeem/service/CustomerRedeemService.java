package com.project.kkookk.redeem.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.controller.dto.CreateRedeemSessionRequest;
import com.project.kkookk.redeem.controller.dto.RedeemSessionResponse;
import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.domain.RedeemSessionStatus;
import com.project.kkookk.redeem.repository.RedeemSessionRepository;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerRedeemService {

    private static final int TTL_SECONDS = 60;

    private final RedeemSessionRepository redeemSessionRepository;
    private final WalletRewardRepository walletRewardRepository;

    @Transactional
    public RedeemSessionResponse createRedeemSession(Long walletId, CreateRedeemSessionRequest request) {
        // 1. 리워드 조회 + 본인 소유 검증
        WalletReward reward =
                walletRewardRepository
                        .findByIdAndWalletId(request.walletRewardId(), walletId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.REWARD_NOT_FOUND));

        // 2. AVAILABLE 상태 검증
        if (!reward.isAvailable()) {
            throw new BusinessException(ErrorCode.REWARD_NOT_AVAILABLE);
        }

        // 3. 중복 PENDING 세션 검증
        boolean hasPendingSession =
                redeemSessionRepository.existsByWalletRewardIdAndStatus(
                        request.walletRewardId(), RedeemSessionStatus.PENDING);
        if (hasPendingSession) {
            throw new BusinessException(ErrorCode.REDEEM_SESSION_ALREADY_EXISTS);
        }

        // 4. WalletReward 상태 변경 (AVAILABLE → REDEEMING)
        reward.startRedeeming();

        // 5. RedeemSession 생성
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(request.walletRewardId())
                        .expiresAt(LocalDateTime.now().plusSeconds(TTL_SECONDS))
                        .build();

        redeemSessionRepository.save(session);

        return RedeemSessionResponse.from(session);
    }
}
