package com.project.kkookk.repository.stampcard;

import com.project.kkookk.domain.stampcard.StampCard;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StampCardRepository extends JpaRepository<StampCard, Long> {

    Optional<StampCard> findByIdAndStoreId(Long id, Long storeId);

    Page<StampCard> findByStoreId(Long storeId, Pageable pageable);

    Page<StampCard> findByStoreIdAndStatus(Long storeId, StampCardStatus status, Pageable pageable);

    boolean existsByStoreIdAndStatus(Long storeId, StampCardStatus status);
}
