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
public class RedeemSessionResponse {

    private Long id;
    private String sessionToken;
    private Long rewardId;
    private String rewardName;
    private String storeName;
    private boolean completed;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
