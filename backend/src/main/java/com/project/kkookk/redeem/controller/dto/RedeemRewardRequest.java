package com.project.kkookk.redeem.controller.dto;

import jakarta.validation.constraints.NotNull;

public record RedeemRewardRequest(@NotNull Long walletRewardId) {}
