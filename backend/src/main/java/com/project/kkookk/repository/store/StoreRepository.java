package com.project.kkookk.repository.store;

import com.project.kkookk.domain.store.Store;
import com.project.kkookk.domain.store.StoreStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwnerAccountIdAndStatus(Long ownerAccountId, StoreStatus status);
}
