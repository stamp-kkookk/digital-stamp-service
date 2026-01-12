package com.kkookk.customer.repository;

import com.kkookk.customer.entity.WalletStampCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletStampCardRepository extends JpaRepository<WalletStampCard, Long> {

    Optional<WalletStampCard> findByWalletIdAndStampCardId(Long walletId, Long stampCardId);

    List<WalletStampCard> findByWalletIdOrderByUpdatedAtDesc(Long walletId);

    boolean existsByWalletIdAndStampCardId(Long walletId, Long stampCardId);
}
