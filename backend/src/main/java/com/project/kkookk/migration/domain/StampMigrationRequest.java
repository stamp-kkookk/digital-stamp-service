package com.project.kkookk.migration.domain;

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
@Table(name = "stamp_migration_request")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StampMigrationRequest extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_wallet_id", nullable = false)
    private Long customerWalletId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StampMigrationStatus status;

    @Column(name = "approved_stamp_count")
    private Integer approvedStampCount;

    @Column(name = "reject_reason", length = 255)
    private String rejectReason;

    @Column(name = "requested_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime requestedAt;

    @Column(name = "processed_at", columnDefinition = "DATETIME(6)")
    private LocalDateTime processedAt;

    @Builder
    private StampMigrationRequest(
            Long customerWalletId, Long storeId, String imageUrl, LocalDateTime requestedAt) {
        this.customerWalletId = customerWalletId;
        this.storeId = storeId;
        this.imageUrl = imageUrl;
        this.status = StampMigrationStatus.SUBMITTED;
        this.requestedAt = requestedAt != null ? requestedAt : LocalDateTime.now();
    }

    public boolean isSubmitted() {
        return this.status == StampMigrationStatus.SUBMITTED;
    }

    public void approve(Integer stampCount) {
        if (!isSubmitted()) {
            throw new IllegalStateException("Only SUBMITTED requests can be approved");
        }
        this.status = StampMigrationStatus.APPROVED;
        this.approvedStampCount = stampCount;
        this.processedAt = LocalDateTime.now();
    }

    public void reject(String reason) {
        if (!isSubmitted()) {
            throw new IllegalStateException("Only SUBMITTED requests can be rejected");
        }
        this.status = StampMigrationStatus.REJECTED;
        this.rejectReason = reason;
        this.processedAt = LocalDateTime.now();
    }

    public void cancel() {
        if (!isSubmitted()) {
            throw new IllegalStateException("Only SUBMITTED requests can be canceled");
        }
        this.status = StampMigrationStatus.CANCELED;
        this.processedAt = LocalDateTime.now();
    }
}
