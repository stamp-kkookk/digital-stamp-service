package com.project.kkookk.wallet.domain;

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
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_wallet")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerWallet extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CustomerWalletStatus status;

    @Builder
    private CustomerWallet(
            String phone, String name, String nickname, CustomerWalletStatus status) {
        this.phone = phone;
        this.name = name;
        this.nickname = nickname;
        this.status = status != null ? status : CustomerWalletStatus.ACTIVE;
    }

    public boolean isActive() {
        return this.status == CustomerWalletStatus.ACTIVE;
    }

    public boolean isBlocked() {
        return this.status == CustomerWalletStatus.BLOCKED;
    }

    public void block() {
        this.status = CustomerWalletStatus.BLOCKED;
    }

    public void activate() {
        this.status = CustomerWalletStatus.ACTIVE;
    }
}
