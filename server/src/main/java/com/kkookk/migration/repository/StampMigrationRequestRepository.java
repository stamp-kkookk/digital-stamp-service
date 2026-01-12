package com.kkookk.migration.repository;

import com.kkookk.migration.entity.MigrationStatus;
import com.kkookk.migration.entity.StampMigrationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StampMigrationRequestRepository extends JpaRepository<StampMigrationRequest, Long> {

    Optional<StampMigrationRequest> findByWalletIdAndStoreId(Long walletId, Long storeId);

    List<StampMigrationRequest> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<StampMigrationRequest> findByStoreIdAndStatusOrderByCreatedAtAsc(Long storeId, MigrationStatus status);

    List<StampMigrationRequest> findByStoreIdOrderByCreatedAtDesc(Long storeId);
}
