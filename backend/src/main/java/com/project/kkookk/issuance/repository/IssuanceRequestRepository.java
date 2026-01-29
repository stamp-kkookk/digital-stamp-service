package com.project.kkookk.issuance.repository;

import com.project.kkookk.issuance.domain.IssuanceRequest;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IssuanceRequestRepository extends JpaRepository<IssuanceRequest, Long> {

    /** 멱등성 조회 (지갑별) 동일 지갑 + 동일 키로 기존 요청 있는지 확인 */
    Optional<IssuanceRequest> findByWalletIdAndIdempotencyKey(Long walletId, String idempotencyKey);

    /** 특정 지갑 스탬프카드에 대해 PENDING 상태인 요청이 있는지 확인 */
    boolean existsByWalletStampCardIdAndStatus(
            Long walletStampCardId, IssuanceRequestStatus status);

    /** 배치 만료 처리용 PENDING 상태이면서 expiresAt이 지난 요청들을 EXPIRED로 변경 */
    @Modifying
    @Query(
            "UPDATE IssuanceRequest r SET r.status = 'EXPIRED' "
                    + "WHERE r.status = 'PENDING' AND r.expiresAt < :now")
    int expirePendingRequests(@Param("now") LocalDateTime now);

    /** 터미널용: 매장의 특정 상태 요청 목록 조회 (생성일 기준 오름차순) */
    @Query(
            "SELECT r FROM IssuanceRequest r "
                    + "WHERE r.storeId = :storeId AND r.status = :status "
                    + "ORDER BY r.createdAt ASC")
    List<IssuanceRequest> findByStoreIdAndStatus(
            @Param("storeId") Long storeId, @Param("status") IssuanceRequestStatus status);

    /** 터미널용: 비관적 락을 걸어서 동시 승인/거절 방지 */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM IssuanceRequest r WHERE r.id = :id")
    Optional<IssuanceRequest> findByIdWithLock(@Param("id") Long id);
}
