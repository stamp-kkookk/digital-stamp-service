package com.project.kkookk.redeem.repository;

import com.project.kkookk.redeem.domain.RedeemEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RedeemEventRepository extends JpaRepository<RedeemEvent, Long> {

    Page<RedeemEvent> findByWalletIdOrderByOccurredAtDesc(Long walletId, Pageable pageable);
}
