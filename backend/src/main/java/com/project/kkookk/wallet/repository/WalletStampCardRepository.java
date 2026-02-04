package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.WalletStampCard;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletStampCardRepository extends JpaRepository<WalletStampCard, Long> {

    /** 비관적 락으로 조회 (동시성 제어) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM WalletStampCard w WHERE w.id = :id")
    Optional<WalletStampCard> findByIdWithLock(@Param("id") Long id);

    List<WalletStampCard> findByCustomerWalletIdOrderByLastStampedAtDesc(Long customerWalletId);

    List<WalletStampCard> findByCustomerWalletIdOrderByCreatedAtDesc(Long customerWalletId);

    Optional<WalletStampCard> findByIdAndCustomerWalletId(Long id, Long customerWalletId);

    /** 고객 지갑의 모든 스탬프카드 조회 */
    List<WalletStampCard> findByCustomerWalletId(Long customerWalletId);

    /** 매장별 고객 지갑 스탬프카드 조회 */
    Optional<WalletStampCard> findByCustomerWalletIdAndStoreId(Long customerWalletId, Long storeId);

    /** 매장별 고객 지갑 스탬프카드 조회 (비관적 락) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
            "SELECT w FROM WalletStampCard w "
                    + "WHERE w.customerWalletId = :customerWalletId AND w.storeId = :storeId")
    Optional<WalletStampCard> findByCustomerWalletIdAndStoreIdWithLock(
            @Param("customerWalletId") Long customerWalletId, @Param("storeId") Long storeId);
}
