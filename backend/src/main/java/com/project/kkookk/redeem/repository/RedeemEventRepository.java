package com.project.kkookk.redeem.repository;

import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RedeemEventRepository extends JpaRepository<RedeemEvent, Long> {

    Page<RedeemEvent> findByWalletIdOrderByOccurredAtDesc(Long walletId, Pageable pageable);

    /** 고객의 특정 매장 리워드 사용 이벤트 조회 */
    Page<RedeemEvent> findByStoreIdAndWalletIdOrderByOccurredAtDesc(
            Long storeId, Long walletId, Pageable pageable);

    @Query(
            """
            SELECT COUNT(e) FROM RedeemEvent e
            WHERE e.storeId = :storeId
            AND e.occurredAt BETWEEN :startDate AND :endDate
            AND e.result = :result
            """)
    long countByStoreIdAndPeriodAndResult(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("result") RedeemEventResult result);

    @Query(
            """
            SELECT
                e.id as id,
                e.redeemSessionId as redeemSessionId,
                cw.nickname as customerNickname,
                sc.rewardName as rewardName,
                sc.title as stampCardTitle,
                e.type as type,
                e.result as result,
                e.occurredAt as occurredAt
            FROM RedeemEvent e
            JOIN RedeemSession rs ON e.redeemSessionId = rs.id
            JOIN WalletReward wr ON rs.walletRewardId = wr.id
            JOIN CustomerWallet cw ON e.walletId = cw.id
            JOIN StampCard sc ON wr.stampCardId = sc.id
            WHERE e.storeId = :storeId
            AND e.type = com.project.kkookk.redeem.domain.RedeemEventType.COMPLETED
            AND e.result = com.project.kkookk.redeem.domain.RedeemEventResult.SUCCESS
            ORDER BY e.occurredAt DESC
            """)
    Page<RedeemEventProjection> findCompletedByStoreId(
            @Param("storeId") Long storeId, Pageable pageable);
}
