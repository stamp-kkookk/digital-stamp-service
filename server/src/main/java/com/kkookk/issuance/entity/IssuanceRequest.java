package com.kkookk.issuance.entity;

import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "issuance_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssuanceRequest {

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

    @Column(nullable = false, unique = true, length = 255)
    private String clientRequestId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IssuanceRequestStatus status;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(length = 500)
    private String rejectionReason;

    @Column
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
