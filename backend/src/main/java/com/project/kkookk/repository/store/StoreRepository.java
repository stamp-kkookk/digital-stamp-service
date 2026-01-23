package com.project.kkookk.repository.store;

import com.project.kkookk.domain.store.Store;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 매장 레포지토리.
 */
public interface StoreRepository extends JpaRepository<Store, Long> {

    /**
     * 점주 ID로 매장 목록 조회.
     *
     * @param ownerAccountId 점주 ID
     * @return 매장 목록
     */
    List<Store> findByOwnerAccountId(Long ownerAccountId);

    /**
     * 매장 ID와 점주 ID로 매장 조회 (권한 검증용).
     *
     * @param id             매장 ID
     * @param ownerAccountId 점주 ID
     * @return 매장
     */
    Optional<Store> findByIdAndOwnerAccountId(Long id, Long ownerAccountId);
}
