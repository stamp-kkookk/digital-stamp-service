package com.project.kkookk.stamp.domain;

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
@Table(name = "stamp_event")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StampEvent extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "stamp_card_id", nullable = false)
    private Long stampCardId;

    @Column(name = "wallet_stamp_card_id")
    private Long walletStampCardId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StampEventType type;

    @Column(nullable = false)
    private Integer delta;

    @Column(length = 255)
    private String reason;

    @Column(name = "occurred_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime occurredAt;

    @Column(name = "issuance_request_id")
    private Long issuanceRequestId;

    @Column(name = "stamp_migration_request_id")
    private Long stampMigrationRequestId;

    @Builder
    private StampEvent(
            Long storeId,
            Long stampCardId,
            Long walletStampCardId,
            StampEventType type,
            Integer delta,
            String reason,
            LocalDateTime occurredAt,
            Long issuanceRequestId,
            Long stampMigrationRequestId) {
        this.storeId = storeId;
        this.stampCardId = stampCardId;
        this.walletStampCardId = walletStampCardId;
        this.type = type;
        this.delta = delta;
        this.reason = reason;
        this.occurredAt = occurredAt != null ? occurredAt : LocalDateTime.now();
        this.issuanceRequestId = issuanceRequestId;
        this.stampMigrationRequestId = stampMigrationRequestId;
    }
}
