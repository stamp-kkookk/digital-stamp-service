package com.project.kkookk.domain;

import com.project.kkookk.common.domain.BaseTimeEntity;
import com.project.kkookk.common.domain.StampCardStatus;
import jakarta.persistence.*;
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
