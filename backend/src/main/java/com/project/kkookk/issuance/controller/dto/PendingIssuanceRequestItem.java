package com.project.kkookk.issuance.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "승인 대기 적립 요청 항목")
public record PendingIssuanceRequestItem(
        @Schema(description = "요청 ID", example = "1") Long id,
        @Schema(description = "고객명", example = "김철수") String customerName,
        @Schema(description = "요청 시각") LocalDateTime requestedAt,
        @Schema(description = "경과 시간 (초)", example = "45") long elapsedSeconds,
        @Schema(description = "만료까지 남은 시간 (초)", example = "75") long remainingSeconds) {}
