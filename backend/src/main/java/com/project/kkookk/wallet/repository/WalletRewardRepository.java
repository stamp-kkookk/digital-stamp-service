package com.project.kkookk.wallet.repository;

import com.project.kkookk.wallet.domain.WalletReward;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRewardRepository extends JpaRepository<WalletReward, Long> {

    Optional<WalletReward> findByIdAndWalletId(Long id, Long walletId);
}
