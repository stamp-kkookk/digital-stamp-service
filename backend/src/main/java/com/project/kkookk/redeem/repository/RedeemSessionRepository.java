package com.project.kkookk.redeem.repository;

import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.domain.RedeemSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RedeemSessionRepository extends JpaRepository<RedeemSession, Long> {

    boolean existsByWalletRewardIdAndStatus(Long walletRewardId, RedeemSessionStatus status);
}
