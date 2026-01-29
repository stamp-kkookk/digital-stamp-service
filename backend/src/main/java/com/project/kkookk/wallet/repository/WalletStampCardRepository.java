package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.WalletStampCard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletStampCardRepository extends JpaRepository<WalletStampCard, Long> {

    List<WalletStampCard> findByCustomerWalletIdOrderByLastStampedAtDesc(Long customerWalletId);

    List<WalletStampCard> findByCustomerWalletIdOrderByCreatedAtDesc(Long customerWalletId);

    List<WalletStampCard> findByCustomerWalletId(Long customerWalletId);

    Optional<WalletStampCard> findByIdAndCustomerWalletId(Long id, Long customerWalletId);
}
