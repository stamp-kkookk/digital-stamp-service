package com.project.kkookk.domain.store;

import com.project.kkookk.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 매장 엔티티.
 */
@Entity
@Table(name = "store")
public class Store extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StoreStatus status;

    @Column(nullable = false, name = "owner_account_id")
    private Long ownerAccountId;

    protected Store() {
    }

    /**
     * 매장 생성자.
     *
     * @param name           매장명
     * @param address        매장 주소
     * @param phone          매장 전화번호
     * @param status         매장 상태
     * @param ownerAccountId 점주 ID
     */
    public Store(
            final String name,
            final String address,
            final String phone,
            final StoreStatus status,
            final Long ownerAccountId
    ) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.status = status;
        this.ownerAccountId = ownerAccountId;
    }

    /**
     * 매장 정보 수정.
     *
     * @param name    매장명
     * @param address 매장 주소
     * @param phone   매장 전화번호
     * @param status  매장 상태
     */
    public void update(
            final String name,
            final String address,
            final String phone,
            final StoreStatus status
    ) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.status = status;
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

    public StoreStatus getStatus() {
        return status;
    }

    public Long getOwnerAccountId() {
        return ownerAccountId;
    }
}
