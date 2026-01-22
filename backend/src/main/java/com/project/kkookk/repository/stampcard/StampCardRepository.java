package com.project.kkookk.repository.stampcard;

import com.project.kkookk.domain.stampcard.StampCard;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StampCardRepository extends JpaRepository<StampCard, Long> {
    List<StampCard> findByStoreIdAndStatus(Long storeId, StampCardStatus status);
}
