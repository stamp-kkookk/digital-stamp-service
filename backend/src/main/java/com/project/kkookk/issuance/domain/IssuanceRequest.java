package com.project.kkookk.issuance.domain;

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
@Table(
        name = "issuance_request",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uk_issuance_wallet_idempotency",
                    columnNames = {"wallet_id", "idempotency_key"})
        },
        indexes = {
            @Index(name = "idx_issuance_wallet_status", columnList = "wallet_id, status"),
            @Index(name = "idx_issuance_expires_pending", columnList = "status, expires_at"),
            @Index(
                    name = "idx_issuance_wallet_card_status",
                    columnList = "wallet_stamp_card_id, status"),
            @Index(name = "idx_issuance_store_status", columnList = "store_id, status")
        })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IssuanceRequest extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(name = "wallet_stamp_card_id", nullable = false)
    private Long walletStampCardId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IssuanceRequestStatus status;

    @Column(name = "idempotency_key", length = 100)
    private String idempotencyKey;

    @Column(name = "expires_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime expiresAt;

    @Column(name = "approved_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime approvedAt;

    @Builder
    private IssuanceRequest(
            Long storeId,
            Long walletId,
            Long walletStampCardId,
            String idempotencyKey,
            LocalDateTime expiresAt) {
        this.storeId = storeId;
        this.walletId = walletId;
        this.walletStampCardId = walletStampCardId;
        this.status = IssuanceRequestStatus.PENDING;
        this.idempotencyKey = idempotencyKey;
        this.expiresAt = expiresAt;
    }

    public boolean isPending() {
        return this.status == IssuanceRequestStatus.PENDING;
    }

    public boolean isExpired() {
        return this.status == IssuanceRequestStatus.EXPIRED
                || LocalDateTime.now().isAfter(expiresAt);
    }

    public void approve() {
        if (!isPending()) {
            throw new IllegalStateException("Only PENDING requests can be approved");
        }
        this.status = IssuanceRequestStatus.APPROVED;
        this.approvedAt = LocalDateTime.now();
    }

    public void reject() {
        if (!isPending()) {
            throw new IllegalStateException("Only PENDING requests can be rejected");
        }
        this.status = IssuanceRequestStatus.REJECTED;
    }

    public void expire() {
        if (!isPending()) {
            throw new IllegalStateException("Only PENDING requests can be expired");
        }
        this.status = IssuanceRequestStatus.EXPIRED;
    }
}
