package com.project.kkookk.admin.controller.dto;

import com.project.kkookk.store.domain.PerformerType;
import com.project.kkookk.store.domain.StoreAuditAction;
import com.project.kkookk.store.domain.StoreAuditLog;
import com.project.kkookk.store.domain.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "매장 감사 로그 응답")
public record StoreAuditLogResponse(
        @Schema(description = "로그 ID") Long id,
        @Schema(description = "매장 ID") Long storeId,
        @Schema(description = "액션") StoreAuditAction action,
        @Schema(description = "이전 상태") StoreStatus previousStatus,
        @Schema(description = "새 상태") StoreStatus newStatus,
        @Schema(description = "수행자 ID") Long performedBy,
        @Schema(description = "수행자 유형") PerformerType performedByType,
        @Schema(description = "상세 내용") String detail,
        @Schema(description = "생성 시각") LocalDateTime createdAt) {

    public static StoreAuditLogResponse from(StoreAuditLog log) {
        return new StoreAuditLogResponse(
                log.getId(),
                log.getStoreId(),
                log.getAction(),
                log.getPreviousStatus(),
                log.getNewStatus(),
                log.getPerformedBy(),
                log.getPerformedByType(),
                log.getDetail(),
                log.getCreatedAt());
    }
}
