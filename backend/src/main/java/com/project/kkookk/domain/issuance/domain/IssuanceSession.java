package com.project.kkookk.domain.issuance.domain;

import com.project.kkookk.common.domain.BaseTimeEntity;
import com.project.kkookk.domain.customer.entity.Customer;
import com.project.kkookk.domain.store.entity.Store;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "issuance_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IssuanceSession extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssuanceStatus status;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder
    public IssuanceSession(Store store, Customer customer, int validityMinutes) {
        this.store = store;
        this.customer = customer;
        this.status = IssuanceStatus.PENDING;
        this.expiresAt = LocalDateTime.now().plusMinutes(validityMinutes);
    }

    public void approve() {
        validateIsPending();
        this.status = IssuanceStatus.APPROVED;
    }

    public void reject() {
        validateIsPending();
        this.status = IssuanceStatus.REJECTED;
    }

    private void validateIsPending() {
        if (this.status != IssuanceStatus.PENDING) {
            // 이 예외는 Service 계층에서 IssuanceRequestNotPendingException으로 변환하여 처리됩니다.
            throw new IllegalStateException("이미 처리되었거나 만료된 요청입니다.");
        }
        if (LocalDateTime.now().isAfter(this.expiresAt)) {
            this.status = IssuanceStatus.EXPIRED;
            throw new IllegalStateException("만료된 요청입니다.");
        }
    }
}
