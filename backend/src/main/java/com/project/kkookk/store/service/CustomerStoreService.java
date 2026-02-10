package com.project.kkookk.store.service;

import com.project.kkookk.global.config.CacheConfig;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.controller.customer.dto.StampCardInfo;
import com.project.kkookk.store.controller.customer.dto.StoreStampCardSummaryResponse;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
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
