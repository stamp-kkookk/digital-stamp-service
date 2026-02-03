package com.project.kkookk.migration.dto;

import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "스탬프 마이그레이션 요청 응답")
public record MigrationRequestResponse(
        @Schema(description = "마이그레이션 요청 ID", example = "1") Long id,
        @Schema(description = "고객 지갑 ID", example = "10") Long customerWalletId,
        @Schema(description = "매장 ID", example = "1") Long storeId,
        @Schema(description = "요청 상태", example = "SUBMITTED") StampMigrationStatus status,
        @Schema(
                        description = "종이 스탬프 판 이미지 (Base64 인코딩)",
                        example = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...")
                String imageData,
        @Schema(description = "고객이 주장한 스탬프 개수", example = "8") Integer claimedStampCount,
        @Schema(description = "승인된 스탬프 개수 (승인 시에만 존재)", example = "7") Integer approvedStampCount,
        @Schema(description = "반려 사유 (반려 시에만 존재)", example = "이미지가 불명확합니다") String rejectReason,
        @Schema(description = "요청 생성 시각", example = "2025-01-15T10:30:00")
                LocalDateTime requestedAt,
        @Schema(description = "처리 완료 시각 (승인/반려 시)", example = "2025-01-16T14:20:00")
                LocalDateTime processedAt,
        @Schema(description = "예상 처리 시간 (SLA)", example = "24~48시간 이내 처리됩니다") String slaMessage) {

    private static final String SLA_MESSAGE = "24~48시간 이내 처리됩니다";

    public static MigrationRequestResponse from(StampMigrationRequest entity) {
        return new MigrationRequestResponse(
                entity.getId(),
                entity.getCustomerWalletId(),
                entity.getStoreId(),
                entity.getStatus(),
                entity.getImageData(),
                entity.getClaimedStampCount(),
                entity.getApprovedStampCount(),
                entity.getRejectReason(),
                entity.getRequestedAt(),
                entity.getProcessedAt(),
                SLA_MESSAGE);
    }
}
