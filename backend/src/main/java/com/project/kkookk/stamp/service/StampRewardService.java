package com.project.kkookk.stamp.service;

import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class StampRewardService {

    private final WalletRewardRepository walletRewardRepository;
    private final WalletStampCardRepository walletStampCardRepository;

    /**
     * 스탬프 적립 후 리워드 발급 처리
     *
     * @param walletStampCard 고객의 스탬프카드
     * @param activeStampCard 현재 ACTIVE인 매장의 스탬프카드 정책
     * @param delta 추가되는 스탬프 수
     * @return 처리 결과 (발급된 리워드, 현재 WalletStampCard)
     */
    public StampAccumulationResult processStampAccumulation(
            WalletStampCard walletStampCard, StampCard activeStampCard, int delta) {

        int currentCount = walletStampCard.getStampCount();
        int newTotal = currentCount + delta;
        int goalStampCount = activeStampCard.getGoalStampCount();

        // 리워드 발급 개수 계산
        int rewardCount = newTotal / goalStampCount;
        int remainder = newTotal % goalStampCount;

        List<WalletReward> issuedRewards = new ArrayList<>();
        WalletStampCard currentWalletStampCard = walletStampCard;

        if (rewardCount > 0) {
            // 리워드 발급
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = calculateExpiresAt(activeStampCard, now);

            for (int i = 0; i < rewardCount; i++) {
                WalletReward reward =
                        WalletReward.builder()
                                .walletId(walletStampCard.getCustomerWalletId())
                                .stampCardId(activeStampCard.getId())
                                .storeId(activeStampCard.getStoreId())
                                .issuedAt(now)
                                .expiresAt(expiresAt)
                                .build();
                issuedRewards.add(reward);
            }

            walletRewardRepository.saveAll(issuedRewards);

            // 기존 WalletStampCard 완료 처리
            walletStampCard.setStampCount(goalStampCount); // 목표 달성 상태로
            walletStampCard.complete();

            // 새 WalletStampCard 생성 (현재 ACTIVE인 StampCard 기준)
            WalletStampCard newWalletStampCard =
                    WalletStampCard.builder()
                            .customerWalletId(walletStampCard.getCustomerWalletId())
                            .storeId(walletStampCard.getStoreId())
                            .stampCardId(activeStampCard.getId())
                            .stampCount(remainder)
                            .build();

            currentWalletStampCard = walletStampCardRepository.save(newWalletStampCard);

            log.info(
                    "Rewards issued and new WalletStampCard created: "
                            + "completedWalletStampCardId={}, newWalletStampCardId={}, "
                            + "rewardCount={}, remainder={}, previousTotal={}, delta={}",
                    walletStampCard.getId(),
                    currentWalletStampCard.getId(),
                    rewardCount,
                    remainder,
                    currentCount,
                    delta);
        } else {
            // 리워드 발급 없이 스탬프만 증가
            walletStampCard.addStamps(delta);
        }

        return new StampAccumulationResult(issuedRewards, currentWalletStampCard);
    }

    private LocalDateTime calculateExpiresAt(StampCard stampCard, LocalDateTime issuedAt) {
        if (stampCard.getExpireDays() == null || stampCard.getExpireDays() <= 0) {
            return null; // 무기한
        }
        return issuedAt.plusDays(stampCard.getExpireDays());
    }

    /** 스탬프 적립 처리 결과 */
    public record StampAccumulationResult(
            List<WalletReward> issuedRewards, WalletStampCard currentWalletStampCard) {

        public int rewardCount() {
            return issuedRewards.size();
        }
    }
}
