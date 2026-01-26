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
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "redeem_session")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RedeemSession extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wallet_reward_id", nullable = false)
    private Long walletRewardId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RedeemSessionStatus status;

    @Column(name = "expires_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime expiresAt;

    @Column(name = "completed_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime completedAt;

    @Builder
    private RedeemSession(Long walletRewardId, LocalDateTime expiresAt) {
        this.walletRewardId = walletRewardId;
        this.status = RedeemSessionStatus.PENDING;
        this.expiresAt = expiresAt;
    }

    public boolean isPending() {
        return this.status == RedeemSessionStatus.PENDING;
    }

    public boolean isExpired() {
        return this.status == RedeemSessionStatus.EXPIRED || LocalDateTime.now().isAfter(expiresAt);
    }

    public void complete() {
        if (!isPending()) {
            throw new IllegalStateException("Only PENDING sessions can be completed");
        }
        this.status = RedeemSessionStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void expire() {
        if (!isPending()) {
            throw new IllegalStateException("Only PENDING sessions can be expired");
        }
        this.status = RedeemSessionStatus.EXPIRED;
    }
}
