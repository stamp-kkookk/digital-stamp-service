package com.project.kkookk.store.repository;

import com.project.kkookk.store.domain.StoreAuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreAuditLogRepository extends JpaRepository<StoreAuditLog, Long> {

    List<StoreAuditLog> findByStoreIdOrderByCreatedAtDesc(Long storeId);
}
