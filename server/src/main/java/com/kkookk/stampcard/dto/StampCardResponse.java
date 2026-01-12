package com.kkookk.stampcard.dto;

import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.stampcard.entity.StampCardStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class StampCardResponse {

    private Long id;
    private Long storeId;
    private String title;
    private String description;
    private StampCardStatus status;
    private String themeColor;
    private Integer stampGoal;
    private String rewardName;
    private Integer rewardExpiresInDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StampCardResponse from(StampCard stampCard) {
        return StampCardResponse.builder()
                .id(stampCard.getId())
                .storeId(stampCard.getStore().getId())
                .title(stampCard.getTitle())
                .description(stampCard.getDescription())
                .status(stampCard.getStatus())
                .themeColor(stampCard.getThemeColor())
                .stampGoal(stampCard.getStampGoal())
                .rewardName(stampCard.getRewardName())
                .rewardExpiresInDays(stampCard.getRewardExpiresInDays())
                .createdAt(stampCard.getCreatedAt())
                .updatedAt(stampCard.getUpdatedAt())
                .build();
    }
}
