package com.project.kkookk.admin.controller.dto;

import com.project.kkookk.store.domain.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Admin 매장 상태 변경 요청")
public record AdminStoreStatusChangeRequest(
        @Schema(description = "변경할 상태", example = "LIVE") @NotNull(message = "상태는 필수입니다")
                StoreStatus status,
        @Schema(description = "변경 사유", example = "운영 승인 완료") String reason) {}
