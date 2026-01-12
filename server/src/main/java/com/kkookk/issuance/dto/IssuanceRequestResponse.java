package com.kkookk.issuance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssuanceRequestResponse {

    private Long id;
    private Long walletId;
    private Long storeId;
    private String storeName;
    private Long stampCardId;
    private String stampCardTitle;
    private String clientRequestId;
    private String status;
    private LocalDateTime expiresAt;
    private String rejectionReason;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
