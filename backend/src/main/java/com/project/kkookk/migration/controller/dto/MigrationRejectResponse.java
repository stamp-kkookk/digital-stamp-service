package com.project.kkookk.migration.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "마이그레이션 반려 응답")
public record MigrationRejectResponse(
        @Schema(description = "요청 ID", example = "1") Long id,
        @Schema(description = "상태", example = "REJECTED") String status,
        @Schema(description = "반려 사유", example = "사진이 불명확합니다. 다시 촬영해주세요.") String rejectReason,
        @Schema(description = "처리 시간", example = "2026-01-31T09:20:00")
                LocalDateTime processedAt) {}
