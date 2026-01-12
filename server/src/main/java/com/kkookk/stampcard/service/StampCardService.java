package com.kkookk.stampcard.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.stampcard.dto.CreateStampCardRequest;
import com.kkookk.stampcard.dto.StampCardResponse;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.stampcard.entity.StampCardStatus;
import com.kkookk.stampcard.repository.StampCardRepository;
import com.kkookk.store.entity.Store;
import com.kkookk.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StampCardService {

    private final StampCardRepository stampCardRepository;
    private final StoreRepository storeRepository;

    @Transactional(readOnly = true)
    public StampCardResponse getStampCard(Long stampCardId, Long ownerId) {
        StampCard stampCard = findStampCardById(stampCardId);
        validateStoreOwnership(stampCard.getStore(), ownerId);
        return StampCardResponse.from(stampCard);
    }

    @Transactional(readOnly = true)
    public Optional<StampCardResponse> getActiveStampCardByStore(Long storeId, Long ownerId) {
        Store store = findStoreById(storeId);
        validateStoreOwnership(store, ownerId);

        return stampCardRepository.findByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE)
                .map(StampCardResponse::from);
    }

    @Transactional
    public StampCardResponse createStampCard(CreateStampCardRequest request, Long ownerId) {
        Store store = findStoreById(request.getStoreId());
        validateStoreOwnership(store, ownerId);

        // Check if there's already an ACTIVE StampCard
        if (stampCardRepository.existsByStoreIdAndStatus(request.getStoreId(), StampCardStatus.ACTIVE)) {
            throw new BusinessException(
                    "SC001",
                    "이미 활성화된 스탬프 카드가 있습니다. 매장당 1개의 활성 스탬프 카드만 허용됩니다.",
                    HttpStatus.CONFLICT
            );
        }

        StampCard stampCard = StampCard.builder()
                .store(store)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(StampCardStatus.ACTIVE)  // Default to ACTIVE
                .themeColor(request.getThemeColor())
                .stampGoal(request.getStampGoal())
                .rewardName(request.getRewardName())
                .rewardExpiresInDays(request.getRewardExpiresInDays())
                .build();

        stampCard = stampCardRepository.save(stampCard);
        return StampCardResponse.from(stampCard);
    }

    private StampCard findStampCardById(Long stampCardId) {
        return stampCardRepository.findById(stampCardId)
                .orElseThrow(() -> new BusinessException(
                        "SC002",
                        "스탬프 카드를 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));
    }

    private Store findStoreById(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(
                        "S001",
                        "매장을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));
    }

    private void validateStoreOwnership(Store store, Long ownerId) {
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new BusinessException(
                    "S002",
                    "해당 매장에 접근할 권한이 없습니다.",
                    HttpStatus.FORBIDDEN
            );
        }
    }
}
