package com.kkookk.migration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MigrationRequestResponse {

    private Long id;
    private Long walletId;
    private Long storeId;
    private String storeName;
    private Long stampCardId;
    private String stampCardTitle;
    private String photoUrl;
    private String status;
    private Integer approvedStampCount;
    private String rejectReason;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
