package com.project.kkookk.global.security;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query(
            "UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.tokenType = :tokenType AND rt.subjectId = :subjectId")
    void revokeAllByTokenTypeAndSubjectId(
            @Param("tokenType") TokenType tokenType, @Param("subjectId") Long subjectId);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
}
