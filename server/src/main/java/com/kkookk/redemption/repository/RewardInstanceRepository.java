package com.kkookk.redemption.repository;

import com.kkookk.redemption.entity.RewardInstance;
import com.kkookk.redemption.entity.RewardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RewardInstanceRepository extends JpaRepository<RewardInstance, Long> {

    List<RewardInstance> findByWalletIdAndStatusOrderByCreatedAtDesc(Long walletId, RewardStatus status);

    List<RewardInstance> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<RewardInstance> findByStatusAndExpiresAtBefore(RewardStatus status, LocalDateTime now);
}
