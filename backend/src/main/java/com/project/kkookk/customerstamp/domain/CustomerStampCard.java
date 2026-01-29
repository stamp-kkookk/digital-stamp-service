package com.project.kkookk.customerstamp.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.wallet.domain.CustomerWallet;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "customer_stamp_cards",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"customer_wallet_id", "store_id", "stamp_card_id"})
        })
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class CustomerStampCard extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_wallet_id", nullable = false)
    private CustomerWallet customerWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stamp_card_id", nullable = false)
    private StampCard stampCard;

    @Column(name = "current_stamps", nullable = false)
    private int currentStamps;

    @Column(name = "is_rewarded", nullable = false)
    private boolean isRewarded;

    private CustomerStampCard(CustomerWallet customerWallet, Store store, StampCard stampCard) {
        this.customerWallet = customerWallet;
        this.store = store;
        this.stampCard = stampCard;
        this.currentStamps = 0;
        this.isRewarded = false;
    }

    public static CustomerStampCard of(
            CustomerWallet customerWallet, Store store, StampCard stampCard) {
        return new CustomerStampCard(customerWallet, store, stampCard);
    }
}
