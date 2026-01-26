package com.project.kkookk.service;

import com.project.kkookk.domain.stampcard.StampCard;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.domain.store.StoreStatus;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.config.CacheConfig;
import com.project.kkookk.controller.dto.StampCardInfo;
import com.project.kkookk.controller.dto.StoreStampCardSummaryResponse;
import com.project.kkookk.repository.stampcard.StampCardRepository;
import com.project.kkookk.repository.store.StoreRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerStoreService {

    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;

    @Cacheable(value = CacheConfig.STORE_SUMMARY_CACHE, key = "#storeId")
    public StoreStampCardSummaryResponse getStoreStampCardSummary(Long storeId) {
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        if (store.getStatus() != StoreStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.STORE_INACTIVE);
        }

        Optional<StampCard> activeStampCardOpt =
                stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                        storeId, StampCardStatus.ACTIVE);

        StampCardInfo stampCardInfo = activeStampCardOpt.map(StampCardInfo::from).orElse(null);

        return new StoreStampCardSummaryResponse(store.getName(), stampCardInfo);
    }
}
