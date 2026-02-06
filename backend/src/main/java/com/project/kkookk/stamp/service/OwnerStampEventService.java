package com.project.kkookk.stamp.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.stamp.controller.owner.dto.StampEventResponse;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerStampEventService {

    private final StampEventRepository stampEventRepository;
    private final StoreRepository storeRepository;

    public Page<StampEventResponse> getStampEvents(Long ownerId, Long storeId, int page, int size) {
        validateStoreOwnership(ownerId, storeId);

        Pageable pageable = PageRequest.of(page, size);
        return stampEventRepository
                .findByStoreIdWithCustomerInfo(storeId, pageable)
                .map(StampEventResponse::from);
    }

    private void validateStoreOwnership(Long ownerId, Long storeId) {
        storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
    }
}
