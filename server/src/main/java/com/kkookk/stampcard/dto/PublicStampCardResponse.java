package com.kkookk.stampcard.dto;

import com.kkookk.stampcard.entity.StampCard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PublicStampCardResponse {

    private Long id;
    private Long storeId;
    private String title;
    private String description;
    private String themeColor;
    private Integer stampGoal;
    private String rewardName;
    private Integer rewardExpiresInDays;

    public static PublicStampCardResponse from(StampCard stampCard) {
        return PublicStampCardResponse.builder()
                .id(stampCard.getId())
                .storeId(stampCard.getStore().getId())
                .title(stampCard.getTitle())
                .description(stampCard.getDescription())
                .themeColor(stampCard.getThemeColor())
                .stampGoal(stampCard.getStampGoal())
                .rewardName(stampCard.getRewardName())
                .rewardExpiresInDays(stampCard.getRewardExpiresInDays())
                .build();
    }
}
