package com.project.kkookk.controller.stampcard.dto;

import com.project.kkookk.domain.stampcard.StampCard;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "스탬프 카드 상세 응답")
public record StampCardResponse(
        @Schema(description = "스탬프 카드 ID", example = "1") Long id,
        @Schema(description = "카드 이름", example = "커피 스탬프 카드") String title,
        @Schema(description = "상태", example = "DRAFT") StampCardStatus status,
        @Schema(description = "목표 스탬프 수", example = "10") Integer goalStampCount,
        @Schema(description = "리워드 달성 기준 스탬프 수", example = "10") Integer requiredStamps,
        @Schema(description = "리워드 명", example = "아메리카노 1잔 무료") String rewardName,
        @Schema(description = "리워드 수량", example = "1") Integer rewardQuantity,
        @Schema(description = "리워드 유효기간(일)", example = "30") Integer expireDays,
        @Schema(description = "카드 디자인 정보(JSON)") String designJson,
        @Schema(description = "소속 매장 ID", example = "100") Long storeId,
        @Schema(description = "생성 시각") LocalDateTime createdAt,
        @Schema(description = "수정 시각") LocalDateTime updatedAt) {

    public static StampCardResponse from(StampCard entity) {
        return new StampCardResponse(
                entity.getId(),
                entity.getTitle(),
                entity.getStatus(),
                entity.getGoalStampCount(),
                entity.getRequiredStamps(),
                entity.getRewardName(),
                entity.getRewardQuantity(),
                entity.getExpireDays(),
                entity.getDesignJson(),
                entity.getStoreId(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
