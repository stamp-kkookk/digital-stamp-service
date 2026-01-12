package com.kkookk.redemption.repository;

import com.kkookk.redemption.entity.RedeemSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RedeemSessionRepository extends JpaRepository<RedeemSession, Long> {

    Optional<RedeemSession> findBySessionToken(String sessionToken);

    Optional<RedeemSession> findByClientRequestId(String clientRequestId);
}
