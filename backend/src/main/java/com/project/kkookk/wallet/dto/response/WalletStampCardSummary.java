package com.project.kkookk.wallet.dto.response;

import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.wallet.domain.WalletStampCard;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "지갑 스탬프카드 요약 정보")
public record WalletStampCardSummary(
        @Schema(description = "지갑 스탬프카드 ID", example = "1") Long walletStampCardId,
        @Schema(description = "스탬프카드 ID", example = "10") Long stampCardId,
        @Schema(description = "스탬프카드 제목", example = "아메리카노 10잔 쿠폰") String title,
        @Schema(description = "현재 적립된 스탬프 개수", example = "7") Integer currentStampCount,
        @Schema(description = "목표 스탬프 개수", example = "10") Integer goalStampCount,
        @Schema(description = "진행률 (%)", example = "70") Integer progressPercentage,
        @Schema(description = "다음 보상 이름", example = "아메리카노 1잔") String nextRewardName,
        @Schema(description = "다음 보상 수량", example = "1") Integer nextRewardQuantity,
        @Schema(description = "다음 보상까지 필요한 스탬프 개수", example = "3") Integer stampsToNextReward,
        @Schema(
                        description = "유효기간 만료일 (expireDays 기준, null이면 무제한)",
                        example = "2026-02-28T23:59:59")
                LocalDateTime expiresAt,
        @Schema(description = "스탬프카드 상태", example = "ACTIVE") StampCardStatus status,
        @Schema(description = "디자인 JSON", example = "{\"bgColor\": \"#FFFFFF\"}") String designJson,
        @Schema(description = "매장 정보") StoreInfo store,
        @Schema(description = "마지막 적립 일시", example = "2026-01-25T14:30:00")
                LocalDateTime lastStampedAt) {

    public static WalletStampCardSummary from(
            WalletStampCard walletStampCard, StampCard stampCard, Store store) {

        int progress =
                (int) ((walletStampCard.getStampCount() * 100.0) / stampCard.getGoalStampCount());

        int stampsToNext =
                stampCard.getRequiredStamps() != null
                        ? stampCard.getRequiredStamps() - walletStampCard.getStampCount()
                        : stampCard.getGoalStampCount() - walletStampCard.getStampCount();

        LocalDateTime expiresAt =
                stampCard.getExpireDays() != null
                        ? walletStampCard.getCreatedAt().plusDays(stampCard.getExpireDays())
                        : null;

        return new WalletStampCardSummary(
                walletStampCard.getId(),
                stampCard.getId(),
                stampCard.getTitle(),
                walletStampCard.getStampCount(),
                stampCard.getGoalStampCount(),
                progress,
                stampCard.getRewardName(),
                stampCard.getRewardQuantity(),
                Math.max(0, stampsToNext),
                expiresAt,
                stampCard.getStatus(),
                stampCard.getDesignJson(),
                StoreInfo.from(store),
                walletStampCard.getLastStampedAt());
    }
}
