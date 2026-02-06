package com.project.kkookk.stamp.repository;

import com.project.kkookk.stamp.domain.StampEventType;
import java.time.LocalDateTime;

public interface StampEventProjection {
    Long getId();

    Long getWalletStampCardId();

    String getCustomerName();

    String getCustomerPhone();

    StampEventType getType();

    Integer getDelta();

    String getReason();

    LocalDateTime getOccurredAt();
}
