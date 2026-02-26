package com.project.kkookk.stampcard.repository;

import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StampCardRepository extends JpaRepository<StampCard, Long> {

    Optional<StampCard> findByIdAndStoreId(Long id, Long storeId);

    Page<StampCard> findByStoreId(Long storeId, Pageable pageable);

    Page<StampCard> findByStoreIdAndStatus(Long storeId, StampCardStatus status, Pageable pageable);

    Optional<StampCard> findByStoreIdAndStatus(Long storeId, StampCardStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM StampCard s WHERE s.storeId = :storeId AND s.status = :status")
    Optional<StampCard> findByStoreIdAndStatusWithLock(
            @Param("storeId") Long storeId, @Param("status") StampCardStatus status);

    boolean existsByStoreIdAndStatus(Long storeId, StampCardStatus status);

    Optional<StampCard> findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
            Long storeId, StampCardStatus status);

    int countByStoreIdAndStatus(Long storeId, StampCardStatus status);
}
