package com.project.kkookk.service;

import com.project.kkookk.common.domain.StampCardStatus;
import com.project.kkookk.common.domain.StoreStatus;
import com.project.kkookk.common.exception.BusinessException;
import com.project.kkookk.common.exception.ErrorCode;
import com.project.kkookk.config.CacheConfig;
import com.project.kkookk.controller.dto.StampCardInfo;
import com.project.kkookk.controller.dto.StoreStampCardSummaryResponse;
import com.project.kkookk.domain.StampCard;
import com.project.kkookk.domain.Store;
import com.project.kkookk.repository.StampCardRepository;
import com.project.kkookk.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerStoreService {

    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;

    @Cacheable(value = CacheConfig.STORE_SUMMARY_CACHE, key = "#storeId")
    public StoreStampCardSummaryResponse getStoreStampCardSummary(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        if (store.getStatus() != StoreStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.STORE_INACTIVE);
        }

        Optional<StampCard> activeStampCardOpt = stampCardRepository
                .findFirstByStoreIdAndStatusOrderByCreatedAtDesc(storeId, StampCardStatus.ACTIVE);

        StampCardInfo stampCardInfo = activeStampCardOpt
                .map(StampCardInfo::from)
                .orElse(null);

        return new StoreStampCardSummaryResponse(store.getName(), stampCardInfo);
    }
}
