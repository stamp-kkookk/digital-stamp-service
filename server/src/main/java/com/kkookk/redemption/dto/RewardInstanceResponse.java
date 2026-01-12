package com.kkookk.redemption.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardInstanceResponse {

    private Long id;
    private Long walletId;
    private Long storeId;
    private String storeName;
    private Long stampCardId;
    private String stampCardTitle;
    private String rewardName;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
    private LocalDateTime createdAt;
}
