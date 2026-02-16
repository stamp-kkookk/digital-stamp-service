package com.project.kkookk.redeem.repository;

import com.project.kkookk.redeem.domain.RedeemEventResult;
import java.time.LocalDateTime;

public interface RedeemEventProjection {

    Long getId();

    Long getWalletRewardId();

    String getCustomerNickname();

    String getRewardName();

    String getStampCardTitle();

    RedeemEventResult getResult();

    LocalDateTime getOccurredAt();
}
