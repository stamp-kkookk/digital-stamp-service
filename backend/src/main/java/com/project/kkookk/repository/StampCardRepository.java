package com.project.kkookk.repository;

import com.project.kkookk.common.domain.StampCardStatus;
import com.project.kkookk.domain.StampCard;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StampCardRepository extends JpaRepository<StampCard, Long> {

    Optional<StampCard> findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
            Long storeId, StampCardStatus status);
}
