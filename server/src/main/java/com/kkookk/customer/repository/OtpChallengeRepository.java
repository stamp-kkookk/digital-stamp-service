package com.kkookk.customer.repository;

import com.kkookk.customer.entity.OtpChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, Long> {

    Optional<OtpChallenge> findTopByPhoneNumberAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String phoneNumber, LocalDateTime now);
}
