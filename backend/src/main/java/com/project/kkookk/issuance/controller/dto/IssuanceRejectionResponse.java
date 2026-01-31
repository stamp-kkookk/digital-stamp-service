package com.project.kkookk.issuance.controller.dto;

import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "적립 요청 거절 응답")
public record IssuanceRejectionResponse(
        @Schema(description = "요청 ID", example = "1") Long id,
        @Schema(description = "처리 상태", example = "REJECTED") IssuanceRequestStatus status,
        @Schema(description = "처리 시각") LocalDateTime processedAt) {}
