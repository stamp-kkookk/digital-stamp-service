package com.project.kkookk.redeem.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.controller.dto.RedeemRewardRequest;
import com.project.kkookk.redeem.controller.dto.RedeemRewardResponse;
import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerRedeemService {

    private final RedeemEventRepository redeemEventRepository;
    private final WalletRewardRepository walletRewardRepository;
    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;

    @Transactional
    public RedeemRewardResponse redeemReward(Long walletId, RedeemRewardRequest request) {
        // 1. 리워드 조회 + 본인 소유 검증
        WalletReward reward =
                walletRewardRepository
                        .findByIdAndWalletId(request.walletRewardId(), walletId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.REWARD_NOT_FOUND));

        // 2. 매장 상태 확인
        Store store =
                storeRepository
                        .findById(reward.getStoreId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getStatus().isOperational()) {
            throw new BusinessException(ErrorCode.STORE_INACTIVE);
        }

        // 3. 만료 여부 검증
        if (reward.isExpired()) {
            throw new BusinessException(ErrorCode.REWARD_EXPIRED);
        }

        // 4. AVAILABLE 상태 검증
        if (!reward.isAvailable()) {
            throw new BusinessException(ErrorCode.REWARD_NOT_AVAILABLE);
        }

        // 5. 상태 전이 (AVAILABLE → REDEEMED)
        try {
            reward.redeem();
            walletRewardRepository.saveAndFlush(reward);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new BusinessException(ErrorCode.REWARD_NOT_AVAILABLE);
        }

        // 6. 원장 적재
        RedeemEvent event =
                RedeemEvent.builder()
                        .walletRewardId(reward.getId())
                        .walletId(walletId)
                        .storeId(reward.getStoreId())
                        .result(RedeemEventResult.SUCCESS)
                        .build();
        redeemEventRepository.save(event);

        // 7. 리워드 이름 조회
        String rewardName =
                stampCardRepository
                        .findById(reward.getStampCardId())
                        .map(StampCard::getRewardName)
                        .orElse("");

        return new RedeemRewardResponse(
                reward.getId(), event.getId(), rewardName, reward.getRedeemedAt());
    }
}
