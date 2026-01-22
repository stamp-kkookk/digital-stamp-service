package com.project.kkookk.service.customer;

import com.project.kkookk.domain.stampcard.StampCard;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.domain.store.StoreStatus;
import com.project.kkookk.dto.store.StoreStampCardInfoResponse;
import com.project.kkookk.repository.stampcard.StampCardRepository;
import com.project.kkookk.repository.store.StoreRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerStoreService {

    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;

    public StoreStampCardInfoResponse getStoreActiveStampCard(Long storeId) {
        // 1. Store 조회 및 검증
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new IllegalArgumentException("Store not found"));

        if (store.getStatus() != StoreStatus.ACTIVE) {
            throw new IllegalArgumentException("Store is not active");
        }

        // 2. Active StampCard 조회
        List<StampCard> activeCards = stampCardRepository.findByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);
        if (activeCards.isEmpty()) {
            throw new IllegalArgumentException("No active stamp card found for this store");
        }

        // MVP: 첫 번째 활성 카드 반환
        StampCard stampCard = activeCards.get(0);

        // 3. Audit Logging
        log.info("Audit:Action=VIEW_STORE_CARD, StoreId={}, StampCardId={}, Result=SUCCESS",
            storeId, stampCard.getId());

        return new StoreStampCardInfoResponse(
            store.getId(),
            store.getName(),
            stampCard.getId(),
            stampCard.getTitle(),
            stampCard.getGoalStampCount(),
            stampCard.getRewardName(),
            stampCard.getDesignJson()
        );
    }
}
