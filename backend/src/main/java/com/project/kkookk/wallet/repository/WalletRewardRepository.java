package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.domain.WalletRewardStatus;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletRewardRepository extends JpaRepository<WalletReward, Long> {

    Optional<WalletReward> findByIdAndWalletId(Long id, Long walletId);

    Page<WalletReward> findByWalletIdOrderByIssuedAtDesc(Long walletId, Pageable pageable);

    Page<WalletReward> findByWalletIdAndStatusOrderByIssuedAtDesc(
            Long walletId, WalletRewardStatus status, Pageable pageable);

    @Query(
            """
            SELECT COUNT(r) FROM WalletReward r
            WHERE r.storeId = :storeId
            AND r.issuedAt BETWEEN :startDate AND :endDate
            """)
    long countByStoreIdAndIssuedAtBetween(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
