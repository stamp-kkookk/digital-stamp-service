package com.project.kkookk.stamp.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.stamp.controller.owner.dto.StampEventResponse;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerStampEventService {

    private final StampEventRepository stampEventRepository;
    private final StoreRepository storeRepository;

    public Page<StampEventResponse> getStampEvents(Long ownerId, Long storeId, int page, int size) {
        validateStoreOwnership(ownerId, storeId);

        Pageable pageable = PageRequest.of(page, size);
        Page<StampEventResponse> result =
                stampEventRepository
                        .findByStoreIdWithCustomerInfo(storeId, pageable)
                        .map(StampEventResponse::from);
        log.info("[StampEvent] Queried storeId={} page={}", storeId, page);
        return result;
    }

    private void validateStoreOwnership(Long ownerId, Long storeId) {
        storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
    }
}
