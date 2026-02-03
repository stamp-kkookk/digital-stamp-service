package com.project.kkookk.migration.repository;

import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StampMigrationRequestRepository
        extends JpaRepository<StampMigrationRequest, Long> {

    Optional<StampMigrationRequest> findByIdAndCustomerWalletId(Long id, Long customerWalletId);

    boolean existsByCustomerWalletIdAndStoreIdAndStatus(
            Long customerWalletId, Long storeId, StampMigrationStatus status);

    List<StampMigrationRequest> findByCustomerWalletIdOrderByRequestedAtDesc(Long customerWalletId);
    List<StampMigrationRequest> findByStoreIdAndStatusOrderByRequestedAtDesc(
            Long storeId, StampMigrationStatus status);

    Optional<StampMigrationRequest> findByIdAndStoreId(Long id, Long storeId);
}
