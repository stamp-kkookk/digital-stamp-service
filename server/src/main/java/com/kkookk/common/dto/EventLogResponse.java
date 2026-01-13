package com.kkookk.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventLogResponse {

    private Long id;
    private String eventType; // STAMP or REDEEM
    private String eventSubType; // ISSUED, MIGRATED, MANUAL_ADJUST, REDEEMED
    private Long walletId;
    private Long storeId;
    private String storeName;
    private Long stampCardId;
    private String stampCardTitle;
    private Integer stampDelta;
    private String rewardName;
    private String requestId;
    private String sessionToken;
    private String notes;
    private LocalDateTime createdAt;
}
