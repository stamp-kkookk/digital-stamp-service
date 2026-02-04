package com.project.kkookk.stamp.repository;

import com.project.kkookk.stamp.domain.StampEvent;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StampEventRepository extends JpaRepository<StampEvent, Long> {

    Page<StampEvent> findByWalletStampCardIdOrderByOccurredAtDesc(
            Long walletStampCardId, Pageable pageable);

    @Query(
            """
            SELECT COALESCE(SUM(e.delta), 0) FROM StampEvent e
            WHERE e.storeId = :storeId
            AND e.occurredAt BETWEEN :startDate AND :endDate
            AND e.delta > 0
            """)
    long sumPositiveDeltaByStoreIdAndPeriod(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(
            """
            SELECT COUNT(DISTINCT e.walletStampCardId) FROM StampEvent e
            WHERE e.storeId = :storeId
            AND e.occurredAt BETWEEN :startDate AND :endDate
            """)
    long countDistinctWalletsByStoreIdAndPeriod(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(
            """
            SELECT FUNCTION('DATE', e.occurredAt) as date, SUM(e.delta) as count
            FROM StampEvent e
            WHERE e.storeId = :storeId
            AND e.occurredAt BETWEEN :startDate AND :endDate
            AND e.delta > 0
            GROUP BY FUNCTION('DATE', e.occurredAt)
            ORDER BY date ASC
            """)
    List<Object[]> findDailyStampCountsByStoreIdAndPeriod(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
