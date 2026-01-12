package com.kkookk.redemption.entity;

import com.kkookk.customer.entity.CustomerWallet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "redeem_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedeemSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CustomerWallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_instance_id", nullable = false)
    private RewardInstance rewardInstance;

    @Column(nullable = false, unique = true, length = 255)
    private String sessionToken;

    @Column(nullable = false, unique = true, length = 255)
    private String clientRequestId;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
