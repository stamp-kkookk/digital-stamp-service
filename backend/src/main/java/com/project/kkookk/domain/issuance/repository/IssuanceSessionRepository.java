package com.project.kkookk.domain.issuance.repository;

import com.project.kkookk.domain.issuance.domain.IssuanceSession;
import com.project.kkookk.domain.issuance.domain.IssuanceStatus;
import com.project.kkookk.domain.issuance.dto.PendingIssuanceRequestResponse;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface IssuanceSessionRepository extends JpaRepository<IssuanceSession, UUID> {

    // N+1 문제를 해결하기 위해 DTO 프로젝션(생성자 표현식) 사용
    @Query("SELECT new com.project.kkookk.domain.issuance.dto.PendingIssuanceRequestResponse(" +
           "s.id, c.nickname, c.phone, s.createdAt, s.expiresAt) " +
           "FROM IssuanceSession s JOIN s.customer c " +
           "WHERE s.store.id = :storeId AND s.status = :status AND s.expiresAt > :now")
    Page<PendingIssuanceRequestResponse> findPendingRequestsByStoreId(
        @Param("storeId") Long storeId,
        @Param("status") IssuanceStatus status,
        @Param("now") LocalDateTime now,
        Pageable pageable
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM IssuanceSession s WHERE s.id = :id")
    Optional<IssuanceSession> findByIdWithLock(@Param("id") UUID id);
}
