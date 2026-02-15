package com.project.kkookk.store.domain;

import com.project.kkookk.global.entity.BaseTimeEntity;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "store")
public class Store extends BaseTimeEntity {

    private static final Map<StoreStatus, Set<StoreStatus>> ALLOWED_TRANSITIONS =
            Map.of(
                    StoreStatus.DRAFT, Set.of(StoreStatus.LIVE, StoreStatus.DELETED),
                    StoreStatus.LIVE, Set.of(StoreStatus.SUSPENDED, StoreStatus.DELETED),
                    StoreStatus.SUSPENDED, Set.of(StoreStatus.LIVE),
                    StoreStatus.DELETED, Set.of());

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;

    @Column(length = 100, unique = true)
    private String placeRef;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String iconImageBase64;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StoreStatus status;

    @Column(nullable = false, name = "owner_account_id")
    private Long ownerAccountId;

    protected Store() {}

    public Store(
            final String name,
            final String address,
            final String phone,
            final String placeRef,
            final String iconImageBase64,
            final String description,
            final Long ownerAccountId) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.placeRef = placeRef;
        this.iconImageBase64 = iconImageBase64;
        this.description = description;
        this.status = StoreStatus.DRAFT;
        this.ownerAccountId = ownerAccountId;
    }

    public void updateInfo(
            final String name,
            final String address,
            final String phone,
            final String description,
            final String iconImageBase64,
            final String placeRef) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.description = description;
        this.iconImageBase64 = iconImageBase64;
        this.placeRef = placeRef;
    }

    public void transitionTo(final StoreStatus newStatus) {
        Set<StoreStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(this.status, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BusinessException(ErrorCode.STORE_STATUS_TRANSITION_INVALID);
        }
        this.status = newStatus;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getPlaceRef() {
        return placeRef;
    }

    public String getIconImageBase64() {
        return iconImageBase64;
    }

    public String getDescription() {
        return description;
    }

    public StoreStatus getStatus() {
        return status;
    }

    public Long getOwnerAccountId() {
        return ownerAccountId;
    }
}
