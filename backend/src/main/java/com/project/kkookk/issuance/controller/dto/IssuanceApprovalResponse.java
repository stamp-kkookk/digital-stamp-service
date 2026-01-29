package com.project.kkookk.issuance.controller.dto;

import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "적립 요청 승인 응답")
public record IssuanceApprovalResponse(
        @Schema(description = "요청 ID", example = "1") Long id,
        @Schema(description = "처리 상태", example = "APPROVED") IssuanceRequestStatus status,
        @Schema(description = "처리 시각") LocalDateTime processedAt,
        @Schema(description = "적립된 스탬프 수", example = "1") int stampDelta,
        @Schema(description = "고객 현재 스탬프 수", example = "5") int currentStampCount) {}
