package com.project.kkookk.repository;

import com.project.kkookk.common.domain.StampCardStatus;
import com.project.kkookk.domain.StampCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StampCardRepository extends JpaRepository<StampCard, Long> {

    Optional<StampCard> findFirstByStoreIdAndStatusOrderByCreatedAtDesc(Long storeId, StampCardStatus status);
}
