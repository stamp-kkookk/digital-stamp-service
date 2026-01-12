package com.kkookk.stampcard.entity;

import com.kkookk.store.entity.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stamp_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StampCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StampCardStatus status;

    @Column(length = 50)
    private String themeColor;

    @Column(nullable = false)
    private Integer stampGoal;  // 목표 스탬프 개수

    @Column(length = 200)
    private String rewardName;  // 리워드 이름 (예: "아메리카노 1잔")

    @Column
    private Integer rewardExpiresInDays;  // 리워드 유효기간 (일)

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
