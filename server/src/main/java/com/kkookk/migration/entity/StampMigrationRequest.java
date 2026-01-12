package com.kkookk.migration.entity;

import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stamp_migration_requests",
       uniqueConstraints = @UniqueConstraint(columnNames = {"wallet_id", "store_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StampMigrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CustomerWallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stamp_card_id", nullable = false)
    private StampCard stampCard;

    @Column(nullable = false, length = 500)
    private String photoPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MigrationStatus status;

    @Column
    private Integer approvedStampCount;

    @Column(length = 500)
    private String rejectReason;

    @Column
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
