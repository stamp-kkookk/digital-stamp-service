package com.project.kkookk.redeem.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "redeem_event")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RedeemEvent extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wallet_reward_id", nullable = false)
    private Long walletRewardId;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RedeemEventResult result;

    @Column(name = "occurred_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime occurredAt;

    @Builder
    private RedeemEvent(
            Long walletRewardId,
            Long walletId,
            Long storeId,
            RedeemEventResult result,
            LocalDateTime occurredAt) {
        this.walletRewardId = walletRewardId;
        this.walletId = walletId;
        this.storeId = storeId;
        this.result = result;
        this.occurredAt = occurredAt != null ? occurredAt : LocalDateTime.now();
    }
}
