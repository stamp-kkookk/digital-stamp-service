package com.kkookk.issuance.repository;

import com.kkookk.issuance.entity.StampEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StampEventRepository extends JpaRepository<StampEvent, Long> {

    List<StampEvent> findByWalletStampCardIdOrderByCreatedAtDesc(Long walletStampCardId);

    List<StampEvent> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
