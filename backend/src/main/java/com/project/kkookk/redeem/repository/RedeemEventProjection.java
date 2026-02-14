package com.project.kkookk.redeem.repository;

import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.domain.RedeemEventType;
import java.time.LocalDateTime;

public interface RedeemEventProjection {

    Long getId();

    Long getRedeemSessionId();

    String getCustomerNickname();

    String getCustomerPhone();

    String getRewardName();

    String getStampCardTitle();

    RedeemEventType getType();

    RedeemEventResult getResult();

    LocalDateTime getOccurredAt();
}
