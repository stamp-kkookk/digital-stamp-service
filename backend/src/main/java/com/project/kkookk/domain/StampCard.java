package com.project.kkookk.domain;

import com.project.kkookk.common.domain.BaseTimeEntity;
import com.project.kkookk.common.domain.StampCardStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stamp_cards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StampCard extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String reward;

    @Column(nullable = false)
    private String stampBenefit;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StampCardStatus status;
}
