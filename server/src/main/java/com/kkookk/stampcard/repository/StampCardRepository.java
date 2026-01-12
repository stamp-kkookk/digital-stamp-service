package com.kkookk.stampcard.repository;

import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.stampcard.entity.StampCardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StampCardRepository extends JpaRepository<StampCard, Long> {

    List<StampCard> findByStoreId(Long storeId);

    Optional<StampCard> findByStoreIdAndStatus(Long storeId, StampCardStatus status);

    boolean existsByStoreIdAndStatus(Long storeId, StampCardStatus status);
}
