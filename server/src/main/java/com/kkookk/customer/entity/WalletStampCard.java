package com.kkookk.customer.entity;

import com.kkookk.stampcard.entity.StampCard;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_stamp_cards",
       uniqueConstraints = @UniqueConstraint(columnNames = {"wallet_id", "stamp_card_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletStampCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CustomerWallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stamp_card_id", nullable = false)
    private StampCard stampCard;

    @Column(nullable = false)
    private Integer stampCount;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
