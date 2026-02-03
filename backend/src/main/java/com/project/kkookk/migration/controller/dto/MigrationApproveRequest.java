package com.project.kkookk.migration.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "마이그레이션 승인 요청")
public record MigrationApproveRequest(
        @Schema(description = "승인할 스탬프 수", example = "5")
                @NotNull(message = "스탬프 수는 필수입니다")
                @Min(value = 1, message = "스탬프 수는 1 이상이어야 합니다")
                Integer approvedStampCount) {}
