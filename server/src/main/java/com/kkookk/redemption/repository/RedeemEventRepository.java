package com.kkookk.redemption.repository;

import com.kkookk.redemption.entity.RedeemEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RedeemEventRepository extends JpaRepository<RedeemEvent, Long> {

    List<RedeemEvent> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
