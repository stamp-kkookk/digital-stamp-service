package com.project.kkookk.store.repository;

import com.project.kkookk.store.domain.Store;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByOwnerAccountId(Long ownerAccountId);

    Optional<Store> findByIdAndOwnerAccountId(Long id, Long ownerAccountId);
}
