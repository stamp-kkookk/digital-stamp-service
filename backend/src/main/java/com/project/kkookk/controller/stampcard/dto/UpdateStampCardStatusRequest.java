package com.project.kkookk.controller.stampcard.dto;

import com.project.kkookk.domain.stampcard.StampCardStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "스탬프 카드 상태 변경 요청")
public record UpdateStampCardStatusRequest(
        @Schema(description = "변경할 상태", example = "ACTIVE") @NotNull(message = "상태는 필수입니다")
                StampCardStatus status) {}
