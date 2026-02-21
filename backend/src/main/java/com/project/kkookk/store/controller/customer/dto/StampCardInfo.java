package com.project.kkookk.store.controller.customer.dto;

import com.project.kkookk.stampcard.domain.StampCard;

public record StampCardInfo(
        Long stampCardId,
        String title,
        String rewardName,
        Integer goalStampCount,
        String designJson) {
    public static StampCardInfo from(StampCard stampCard) {
        return new StampCardInfo(
                stampCard.getId(),
                stampCard.getTitle(),
                stampCard.getRewardName(),
                stampCard.getGoalStampCount(),
                stampCard.getDesignJson());
    }
}
