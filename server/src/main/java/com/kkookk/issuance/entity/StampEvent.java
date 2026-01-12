package com.kkookk.issuance.entity;

import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.customer.entity.WalletStampCard;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stamp_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StampEvent {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_stamp_card_id", nullable = false)
    private WalletStampCard walletStampCard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StampEventType eventType;

    @Column(nullable = false)
    private Integer stampDelta;

    @Column(length = 255)
    private String requestId;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
