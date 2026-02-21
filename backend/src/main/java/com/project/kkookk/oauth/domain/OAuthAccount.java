package com.project.kkookk.oauth.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "oauth_account",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "uk_provider_provider_id",
                        columnNames = {"provider", "provider_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OAuthAccount extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OAuthProvider provider;

    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(length = 255)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(name = "owner_account_id")
    private Long ownerAccountId;

    @Column(name = "customer_wallet_id")
    private Long customerWalletId;

    @Builder
    private OAuthAccount(
            OAuthProvider provider,
            String providerId,
            String email,
            String name,
            Long ownerAccountId,
            Long customerWalletId) {
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.name = name;
        this.ownerAccountId = ownerAccountId;
        this.customerWalletId = customerWalletId;
    }

    public void linkOwner(Long ownerAccountId) {
        this.ownerAccountId = ownerAccountId;
    }

    public void linkCustomer(Long customerWalletId) {
        this.customerWalletId = customerWalletId;
    }
}
