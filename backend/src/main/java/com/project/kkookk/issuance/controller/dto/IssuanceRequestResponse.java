package com.project.kkookk.issuance.controller.dto;

import com.project.kkookk.issuance.domain.IssuanceRequest;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Schema(description = "적립 요청 응답")
public record IssuanceRequestResponse(
        @Schema(description = "요청 ID", example = "1") Long id,
        @Schema(description = "요청 상태", example = "PENDING") IssuanceRequestStatus status,
        @Schema(description = "만료 시각", example = "2025-01-15T10:32:00") LocalDateTime expiresAt,
        @Schema(description = "남은 시간 (초)", example = "118") Long remainingSeconds,
        @Schema(description = "요청 번호 (CS용)", example = "REQ-20250115-ABC123") String requestNumber,
        @Schema(description = "현재 스탬프 개수", example = "3") Integer currentStampCount,
        @Schema(description = "적립 후 스탬프 개수", example = "4") Integer afterStampCount,
        @Schema(description = "요청 생성 시각") LocalDateTime createdAt) {

    public static IssuanceRequestResponse from(IssuanceRequest entity, int currentStampCount) {
        LocalDateTime now = LocalDateTime.now();
        long remaining = Duration.between(now, entity.getExpiresAt()).getSeconds();

        return new IssuanceRequestResponse(
                entity.getId(),
                entity.getStatus(),
                entity.getExpiresAt(),
                Math.max(0, remaining),
                generateRequestNumber(entity),
                currentStampCount,
                currentStampCount + 1,
                entity.getCreatedAt());
    }

    private static String generateRequestNumber(IssuanceRequest entity) {
        String datePart = entity.getCreatedAt().format(DateTimeFormatter.BASIC_ISO_DATE);
        String idPart = Long.toString(entity.getId(), 36).toUpperCase();
        return "REQ-" + datePart + "-" + idPart;
    }
}
