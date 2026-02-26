package com.project.kkookk.migration.repository;

import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StampMigrationRequestRepository
        extends JpaRepository<StampMigrationRequest, Long> {

    Optional<StampMigrationRequest> findByIdAndCustomerWalletId(Long id, Long customerWalletId);

    boolean existsByCustomerWalletIdAndStoreIdAndStatus(
            Long customerWalletId, Long storeId, StampMigrationStatus status);

    List<StampMigrationRequest> findByCustomerWalletIdOrderByRequestedAtDesc(Long customerWalletId);

    List<StampMigrationRequest> findByStoreIdAndStatusOrderByRequestedAtDesc(
            Long storeId, StampMigrationStatus status);

    Optional<StampMigrationRequest> findByIdAndStoreId(Long id, Long storeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM StampMigrationRequest m WHERE m.id = :id AND m.storeId = :storeId")
    Optional<StampMigrationRequest> findByIdAndStoreIdWithLock(
            @Param("id") Long id, @Param("storeId") Long storeId);
}
