package com.project.kkookk.wallet.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wallet_reward")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WalletReward extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(name = "stamp_card_id", nullable = false)
    private Long stampCardId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WalletRewardStatus status;

    @Column(name = "issued_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime issuedAt;

    @Column(name = "expires_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime expiresAt;

    @Column(name = "redeemed_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime redeemedAt;

    @Version private Long version;

    @Builder
    private WalletReward(
            Long walletId,
            Long stampCardId,
            Long storeId,
            LocalDateTime issuedAt,
            LocalDateTime expiresAt) {
        this.walletId = walletId;
        this.stampCardId = stampCardId;
        this.storeId = storeId;
        this.status = WalletRewardStatus.AVAILABLE;
        this.issuedAt = issuedAt != null ? issuedAt : LocalDateTime.now();
        this.expiresAt = expiresAt;
    }

    public boolean isAvailable() {
        return this.status == WalletRewardStatus.AVAILABLE
                && (expiresAt == null || LocalDateTime.now().isBefore(expiresAt));
    }

    public boolean isExpired() {
        return this.status == WalletRewardStatus.EXPIRED
                || expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }

    public void redeem() {
        if (!isAvailable()) {
            throw new IllegalStateException("Only AVAILABLE rewards can be redeemed");
        }
        this.status = WalletRewardStatus.REDEEMED;
        this.redeemedAt = LocalDateTime.now();
    }

    public void expire() {
        if (this.status == WalletRewardStatus.REDEEMED) {
            throw new IllegalStateException("REDEEMED rewards cannot be expired");
        }
        this.status = WalletRewardStatus.EXPIRED;
    }
}
