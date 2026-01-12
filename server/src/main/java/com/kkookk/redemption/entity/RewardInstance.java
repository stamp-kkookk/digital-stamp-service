package com.kkookk.redemption.entity;

import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.customer.entity.WalletStampCard;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reward_instances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardInstance {

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

    @Column(nullable = false, length = 200)
    private String rewardName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RewardStatus status;

    @Column
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime usedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
