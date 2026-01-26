package com.project.kkookk.redeem.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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

    @Column(name = "redeem_session_id", nullable = false)
    private Long redeemSessionId;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RedeemEventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RedeemEventResult result;

    @Column(name = "occurred_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime occurredAt;

    @Builder
    private RedeemEvent(
            Long redeemSessionId,
            Long walletId,
            Long storeId,
            RedeemEventType type,
            RedeemEventResult result,
            LocalDateTime occurredAt) {
        this.redeemSessionId = redeemSessionId;
        this.walletId = walletId;
        this.storeId = storeId;
        this.type = type;
        this.result = result;
        this.occurredAt = occurredAt != null ? occurredAt : LocalDateTime.now();
    }
}
