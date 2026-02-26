package com.project.kkookk.stampcard.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stamp_cards")
public class StampCard extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(nullable = false, length = 100)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StampCardStatus status;

    @Column(name = "goal_stamp_count", nullable = false)
    private Integer goalStampCount;

    @Column(name = "required_stamps")
    private Integer requiredStamps;

    @Column(name = "reward_name", length = 255)
    private String rewardName;

    @Column(name = "reward_quantity")
    private Integer rewardQuantity;

    @Column(name = "expire_days")
    private Integer expireDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "design_type", nullable = false, length = 20)
    private StampCardDesignType designType;

    @Column(name = "design_json", columnDefinition = "MEDIUMTEXT")
    private String designJson;

    @Column(name = "background_image_key", length = 255)
    private String backgroundImageKey;

    @Column(name = "stamp_image_key", length = 255)
    private String stampImageKey;

    protected StampCard() {}

    private StampCard(Builder builder) {
        this.storeId = builder.storeId;
        this.title = builder.title;
        this.status = StampCardStatus.DRAFT;
        this.goalStampCount = builder.goalStampCount;
        this.requiredStamps = builder.requiredStamps;
        this.rewardName = builder.rewardName;
        this.rewardQuantity = builder.rewardQuantity;
        this.expireDays = builder.expireDays;
        this.designType =
                builder.designType != null ? builder.designType : StampCardDesignType.COLOR;
        this.designJson = builder.designJson;
        this.backgroundImageKey = builder.backgroundImageKey;
        this.stampImageKey = builder.stampImageKey;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getId() {
        return id;
    }

    public Long getStoreId() {
        return storeId;
    }

    public String getTitle() {
        return title;
    }

    public StampCardStatus getStatus() {
        return status;
    }

    public Integer getGoalStampCount() {
        return goalStampCount;
    }

    public Integer getRequiredStamps() {
        return requiredStamps;
    }

    public String getRewardName() {
        return rewardName;
    }

    public Integer getRewardQuantity() {
        return rewardQuantity;
    }

    public Integer getExpireDays() {
        return expireDays;
    }

    public StampCardDesignType getDesignType() {
        return designType;
    }

    public String getDesignJson() {
        return designJson;
    }

    public String getBackgroundImageKey() {
        return backgroundImageKey;
    }

    public String getStampImageKey() {
        return stampImageKey;
    }

    public boolean isDraft() {
        return this.status == StampCardStatus.DRAFT;
    }

    public boolean isActive() {
        return this.status == StampCardStatus.ACTIVE;
    }

    public void updateStatus(StampCardStatus newStatus) {
        this.status = newStatus;
    }

    public void update(
            String title,
            Integer goalStampCount,
            Integer requiredStamps,
            String rewardName,
            Integer rewardQuantity,
            Integer expireDays,
            StampCardDesignType designType,
            String designJson,
            String backgroundImageKey,
            String stampImageKey) {
        this.title = title;
        this.goalStampCount = goalStampCount;
        this.requiredStamps = requiredStamps;
        this.rewardName = rewardName;
        this.rewardQuantity = rewardQuantity;
        this.expireDays = expireDays;
        this.designType = designType != null ? designType : this.designType;
        this.designJson = designJson;
        this.backgroundImageKey = backgroundImageKey;
        this.stampImageKey = stampImageKey;
    }

    public static class Builder {

        private Long storeId;
        private String title;
        private Integer goalStampCount;
        private Integer requiredStamps;
        private String rewardName;
        private Integer rewardQuantity;
        private Integer expireDays;
        private StampCardDesignType designType;
        private String designJson;
        private String backgroundImageKey;
        private String stampImageKey;

        public Builder storeId(Long storeId) {
            this.storeId = storeId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder goalStampCount(Integer goalStampCount) {
            this.goalStampCount = goalStampCount;
            return this;
        }

        public Builder requiredStamps(Integer requiredStamps) {
            this.requiredStamps = requiredStamps;
            return this;
        }

        public Builder rewardName(String rewardName) {
            this.rewardName = rewardName;
            return this;
        }

        public Builder rewardQuantity(Integer rewardQuantity) {
            this.rewardQuantity = rewardQuantity;
            return this;
        }

        public Builder expireDays(Integer expireDays) {
            this.expireDays = expireDays;
            return this;
        }

        public Builder designType(StampCardDesignType designType) {
            this.designType = designType;
            return this;
        }

        public Builder designJson(String designJson) {
            this.designJson = designJson;
            return this;
        }

        public Builder backgroundImageKey(String backgroundImageKey) {
            this.backgroundImageKey = backgroundImageKey;
            return this;
        }

        public Builder stampImageKey(String stampImageKey) {
            this.stampImageKey = stampImageKey;
            return this;
        }

        public StampCard build() {
            return new StampCard(this);
        }
    }
}
