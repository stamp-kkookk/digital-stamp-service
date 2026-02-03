package com.project.kkookk.migration.dto;

import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "스탬프 마이그레이션 요청 목록 항목 (이미지 제외)")
public record MigrationListItemResponse(
        @Schema(description = "마이그레이션 요청 ID", example = "1") Long id,
        @Schema(description = "매장 ID", example = "1") Long storeId,
        @Schema(description = "요청 상태", example = "SUBMITTED") StampMigrationStatus status,
        @Schema(description = "고객이 주장한 스탬프 개수", example = "8") Integer claimedStampCount,
        @Schema(description = "승인된 스탬프 개수 (승인 시에만 존재)", example = "7") Integer approvedStampCount,
        @Schema(description = "반려 사유 (반려 시에만 존재)", example = "이미지가 불명확합니다") String rejectReason,
        @Schema(description = "요청 생성 시각", example = "2025-01-15T10:30:00")
                LocalDateTime requestedAt,
        @Schema(description = "처리 완료 시각 (승인/반려 시)", example = "2025-01-16T14:20:00")
                LocalDateTime processedAt) {

    public static MigrationListItemResponse from(StampMigrationRequest entity) {
        return new MigrationListItemResponse(
                entity.getId(),
                entity.getStoreId(),
                entity.getStatus(),
                entity.getClaimedStampCount(),
                entity.getApprovedStampCount(),
                entity.getRejectReason(),
                entity.getRequestedAt(),
                entity.getProcessedAt());
    }
}
