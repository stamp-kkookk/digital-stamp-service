package com.project.kkookk.redeem.repository;

import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.domain.RedeemSessionStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RedeemSessionRepository extends JpaRepository<RedeemSession, Long> {

    boolean existsByWalletRewardIdAndStatus(Long walletRewardId, RedeemSessionStatus status);

    @Query(
            """
            SELECT rs FROM RedeemSession rs
            JOIN WalletReward wr ON rs.walletRewardId = wr.id
            WHERE wr.storeId = :storeId
            AND rs.status = :status
            ORDER BY rs.createdAt ASC
            """)
    List<RedeemSession> findByStoreIdAndStatus(
            @Param("storeId") Long storeId, @Param("status") RedeemSessionStatus status);
}
