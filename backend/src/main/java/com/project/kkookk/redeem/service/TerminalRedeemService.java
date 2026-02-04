package com.project.kkookk.redeem.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.controller.dto.PendingRedeemSessionItem;
import com.project.kkookk.redeem.controller.dto.PendingRedeemSessionListResponse;
import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.domain.RedeemSessionStatus;
import com.project.kkookk.redeem.repository.RedeemSessionRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TerminalRedeemService {

    private final RedeemSessionRepository redeemSessionRepository;
    private final WalletRewardRepository walletRewardRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final StampCardRepository stampCardRepository;
    private final StoreRepository storeRepository;

    public PendingRedeemSessionListResponse getPendingRedeemSessions(Long storeId, Long ownerId) {
        // 1. 매장 존재 및 소유권 검증
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getOwnerAccountId().equals(ownerId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 2. PENDING 상태 리딤 세션 조회
        List<RedeemSession> pendingSessions =
                redeemSessionRepository.findByStoreIdAndStatus(
                        storeId, RedeemSessionStatus.PENDING);

        // 3. 만료되지 않은 세션만 필터링하고 DTO로 변환
        LocalDateTime now = LocalDateTime.now();
        List<PendingRedeemSessionItem> items = new ArrayList<>();

        for (RedeemSession session : pendingSessions) {
            // 만료된 세션 스킵
            if (now.isAfter(session.getExpiresAt())) {
                continue;
            }

            // 관련 정보 조회
            WalletReward reward =
                    walletRewardRepository.findById(session.getWalletRewardId()).orElse(null);
            if (reward == null) {
                continue;
            }

            CustomerWallet wallet =
                    customerWalletRepository.findById(reward.getWalletId()).orElse(null);
            if (wallet == null) {
                continue;
            }

            StampCard stampCard =
                    stampCardRepository.findById(reward.getStampCardId()).orElse(null);

            String rewardName = stampCard != null ? stampCard.getRewardName() : "리워드";
            long remainingSeconds = Duration.between(now, session.getExpiresAt()).getSeconds();

            items.add(
                    new PendingRedeemSessionItem(
                            session.getId(),
                            wallet.getNickname(),
                            rewardName,
                            Math.max(0, remainingSeconds),
                            session.getCreatedAt()));
        }

        return PendingRedeemSessionListResponse.of(items);
    }
}
