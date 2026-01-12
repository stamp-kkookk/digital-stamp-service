package com.kkookk.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletStampCardResponse {

    private Long id;
    private Long storeId;
    private String storeName;
    private String storeAddress;
    private Long stampCardId;
    private String stampCardTitle;
    private String stampCardDescription;
    private Integer stampGoal;
    private String rewardName;
    private Integer rewardExpiresInDays;
    private String themeColor;
    private Integer stampCount;
    private LocalDateTime updatedAt;
}
