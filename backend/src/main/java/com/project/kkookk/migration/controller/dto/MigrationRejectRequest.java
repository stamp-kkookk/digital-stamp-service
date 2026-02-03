package com.project.kkookk.migration.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "마이그레이션 반려 요청")
public record MigrationRejectRequest(
        @Schema(description = "반려 사유", example = "사진이 불명확합니다. 다시 촬영해주세요.")
                @NotBlank(message = "반려 사유는 필수입니다")
                @Size(max = 255, message = "반려 사유는 255자 이하여야 합니다")
                String rejectReason) {}
