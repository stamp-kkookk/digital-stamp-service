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
}
