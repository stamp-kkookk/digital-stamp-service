package com.project.kkookk.redeem.event;

import com.project.kkookk.global.event.DomainEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import java.time.LocalDateTime;
import java.util.UUID;

public record RewardRedeemedEvent(
        UUID eventId,
        Long aggregateId,
        Long walletRewardId,
        Long walletId,
        Long storeId,
        RedeemEventResult result,
        LocalDateTime occurredAt)
        implements DomainEvent {

    public RewardRedeemedEvent(
            Long walletRewardId, Long walletId, Long storeId, RedeemEventResult result) {
        this(
                UUID.randomUUID(),
                walletRewardId,
                walletRewardId,
                walletId,
                storeId,
                result,
                LocalDateTime.now());
    }

    @Override
    public String aggregateType() {
        return "WalletReward";
    }
}
