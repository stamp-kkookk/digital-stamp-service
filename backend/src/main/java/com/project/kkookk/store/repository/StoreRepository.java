package com.project.kkookk.store.repository;

import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StoreRepository extends JpaRepository<Store, Long> {

    List<Store> findByOwnerAccountId(Long ownerAccountId);

    List<Store> findByOwnerAccountIdAndStatusNot(Long ownerAccountId, StoreStatus excludeStatus);

    Optional<Store> findByIdAndOwnerAccountId(Long id, Long ownerAccountId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Store s WHERE s.id = :id AND s.ownerAccountId = :ownerAccountId")
    Optional<Store> findByIdAndOwnerAccountIdWithLock(
            @Param("id") Long id, @Param("ownerAccountId") Long ownerAccountId);

    List<Store> findByStatus(StoreStatus status);

    boolean existsByPlaceRef(String placeRef);

    boolean existsByPlaceRefAndIdNot(String placeRef, Long id);
}
