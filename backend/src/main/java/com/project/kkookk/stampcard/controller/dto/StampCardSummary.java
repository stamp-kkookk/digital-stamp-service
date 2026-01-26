package com.project.kkookk.stampcard.controller.dto;

import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "스탬프 카드 요약 정보")
public record StampCardSummary(
        @Schema(description = "스탬프 카드 ID", example = "1") Long id,
        @Schema(description = "카드 이름", example = "커피 스탬프 카드") String title,
        @Schema(description = "상태", example = "ACTIVE") StampCardStatus status,
        @Schema(description = "목표 스탬프 수", example = "10") Integer goalStampCount,
        @Schema(description = "리워드 명", example = "아메리카노 1잔 무료") String rewardName,
        @Schema(description = "생성 시각") LocalDateTime createdAt) {

    public static StampCardSummary from(StampCard entity) {
        return new StampCardSummary(
                entity.getId(),
                entity.getTitle(),
                entity.getStatus(),
                entity.getGoalStampCount(),
                entity.getRewardName(),
                entity.getCreatedAt());
    }
}
