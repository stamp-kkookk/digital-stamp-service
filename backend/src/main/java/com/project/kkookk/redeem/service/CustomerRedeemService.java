package com.project.kkookk.redeem.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.controller.dto.CreateRedeemSessionRequest;
import com.project.kkookk.redeem.controller.dto.RedeemSessionResponse;
import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.domain.RedeemEventType;
import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.domain.RedeemSessionStatus;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
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
    private final RedeemEventRepository redeemEventRepository;
    private final WalletRewardRepository walletRewardRepository;

    @Transactional
    public RedeemSessionResponse createRedeemSession(
            Long walletId, CreateRedeemSessionRequest request) {
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

    @Transactional
    public RedeemSessionResponse completeRedeemSession(Long sessionId, Long walletId) {
        // 1. 세션 조회
        RedeemSession session =
                redeemSessionRepository
                        .findById(sessionId)
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.REDEEM_SESSION_NOT_FOUND));

        // 2. 리워드 조회 + 소유권 검증
        WalletReward reward =
                walletRewardRepository
                        .findByIdAndWalletId(session.getWalletRewardId(), walletId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.REWARD_NOT_FOUND));

        // 3. PENDING 상태 검증
        if (!session.isPending()) {
            throw new BusinessException(ErrorCode.REDEEM_SESSION_NOT_PENDING);
        }

        // 4. TTL 만료 검증
        if (session.isExpired()) {
            session.expire();
            reward.cancelRedeeming();
            throw new BusinessException(ErrorCode.REDEEM_SESSION_EXPIRED);
        }

        // 5. 상태 전이
        session.complete();
        reward.completeRedeem();

        // 6. 원장 적재
        RedeemEvent event =
                RedeemEvent.builder()
                        .redeemSessionId(session.getId())
                        .walletId(walletId)
                        .storeId(reward.getStoreId())
                        .type(RedeemEventType.COMPLETED)
                        .result(RedeemEventResult.SUCCESS)
                        .build();
        redeemEventRepository.save(event);

        return RedeemSessionResponse.from(session);
    }
}
