package com.project.kkookk.wallet.dto;

import com.project.kkookk.customerstamp.domain.CustomerStampCard;
import com.project.kkookk.stampcard.domain.StampCard;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "스탬프 카드 정보 DTO")
public record StampCardInfo(
        @Schema(description = "스탬프 카드 ID") Long stampCardId,
        @Schema(description = "매장 ID") Long storeId,
        @Schema(description = "매장 이름") String storeName,
        @Schema(description = "현재 스탬프 개수") int currentStamps,
        @Schema(description = "리워드를 받기 위한 총 스탬프 개수") int totalStampsToReward,
        @Schema(description = "리워드 이름") String rewardName,
        @Schema(description = "리워드를 받았는지 여부") boolean isRewarded) {
    public static StampCardInfo of(CustomerStampCard customerStampCard) {
        StampCard stampCardTemplate = customerStampCard.getStampCard();
        return new StampCardInfo(
                customerStampCard.getId(),
                customerStampCard.getStore().getId(),
                customerStampCard.getStore().getName(),
                customerStampCard.getCurrentStamps(),
                stampCardTemplate.getGoalStampCount(),
                stampCardTemplate.getRewardName(),
                customerStampCard.isRewarded());
    }
}
