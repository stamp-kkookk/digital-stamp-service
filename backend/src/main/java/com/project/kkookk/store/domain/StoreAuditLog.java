package com.project.kkookk.store.domain;

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
import org.springframework.data.annotation.CreatedDate;

@Entity
@Table(
        name = "store_audit_log",
        indexes = {
            @Index(name = "idx_sal_store", columnList = "storeId"),
            @Index(name = "idx_sal_created", columnList = "createdAt")
        })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StoreAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long storeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StoreAuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StoreStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StoreStatus newStatus;

    private Long performedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PerformerType performedByType;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @CreatedDate
    @Column(nullable = false, updatable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime createdAt;

    @Builder
    private StoreAuditLog(
            Long storeId,
            StoreAuditAction action,
            StoreStatus previousStatus,
            StoreStatus newStatus,
            Long performedBy,
            PerformerType performedByType,
            String detail) {
        this.storeId = storeId;
        this.action = action;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.performedBy = performedBy;
        this.performedByType = performedByType;
        this.detail = detail;
        this.createdAt = LocalDateTime.now();
    }
}
