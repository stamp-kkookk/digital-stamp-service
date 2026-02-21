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
@Table(name = "wallet_stamp_card")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WalletStampCard extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_wallet_id", nullable = false)
    private Long customerWalletId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "stamp_card_id", nullable = false)
    private Long stampCardId;

    @Column(name = "stamp_count", nullable = false)
    private Integer stampCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WalletStampCardStatus status;

    @Column(name = "last_stamped_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime lastStampedAt;

    @Column(name = "completed_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime completedAt;

    @Version private Long version;

    @Builder
    private WalletStampCard(
            Long customerWalletId, Long storeId, Long stampCardId, Integer stampCount) {
        this.customerWalletId = customerWalletId;
        this.storeId = storeId;
        this.stampCardId = stampCardId;
        this.stampCount = stampCount != null ? stampCount : 0;
        this.status = WalletStampCardStatus.ACTIVE;
    }

    public void addStamps(int delta) {
        this.stampCount += delta;
        this.lastStampedAt = LocalDateTime.now();
    }

    public void setStampCount(int count) {
        this.stampCount = count;
        this.lastStampedAt = LocalDateTime.now();
    }

    public void resetStamps() {
        this.stampCount = 0;
    }

    public void complete() {
        this.status = WalletStampCardStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return this.status == WalletStampCardStatus.ACTIVE;
    }
}
