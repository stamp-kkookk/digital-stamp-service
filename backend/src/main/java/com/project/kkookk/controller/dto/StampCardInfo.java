package com.project.kkookk.controller.dto;

import com.project.kkookk.domain.StampCard;

public record StampCardInfo(
    Long stampCardId,
    String name,
    String reward,
    String stampBenefit,
    String imageUrl
) {
    public static StampCardInfo from(StampCard stampCard) {
        return new StampCardInfo(
            stampCard.getId(),
            stampCard.getName(),
            stampCard.getReward(),
            stampCard.getStampBenefit(),
            stampCard.getImageUrl()
        );
    }
}
