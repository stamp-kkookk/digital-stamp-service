package com.project.kkookk.domain.stampcard;

import com.project.kkookk.domain.store.Store;
import com.project.kkookk.global.entity.BaseEntity;
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
@Table(name = "stamp_card")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StampCard extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StampCardStatus status;

    @Column(nullable = false)
    private int goalStampCount;

    private String rewardName;

    @Column(columnDefinition = "TEXT")
    private String designJson;

    public StampCard(Store store, String title, StampCardStatus status, int goalStampCount, String rewardName, String designJson) {
        this.store = store;
        this.title = title;
        this.status = status;
        this.goalStampCount = goalStampCount;
        this.rewardName = rewardName;
        this.designJson = designJson;
    }
}
