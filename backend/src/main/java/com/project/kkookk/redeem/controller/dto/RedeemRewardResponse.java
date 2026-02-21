package com.project.kkookk.redeem.controller.dto;

import java.time.LocalDateTime;

public record RedeemRewardResponse(
        Long walletRewardId, Long redeemEventId, String rewardName, LocalDateTime redeemedAt) {}
