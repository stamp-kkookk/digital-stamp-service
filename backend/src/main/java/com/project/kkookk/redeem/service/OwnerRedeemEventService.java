package com.project.kkookk.redeem.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.controller.owner.dto.RedeemEventResponse;
import com.project.kkookk.redeem.repository.RedeemEventProjection;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
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
public class OwnerRedeemEventService {

    private final RedeemEventRepository redeemEventRepository;
    private final StoreRepository storeRepository;

    public Page<RedeemEventResponse> getCompletedRedeemEvents(
            Long ownerId, Long storeId, int page, int size) {
        validateStoreOwnership(ownerId, storeId);

        Pageable pageable = PageRequest.of(page, size);
        Page<RedeemEventProjection> events =
                redeemEventRepository.findCompletedByStoreId(storeId, pageable);

        log.info(
                "[Redeem] Events queried storeId={} page={} resultCount={}",
                storeId,
                page,
                events.getTotalElements());

        return events.map(RedeemEventResponse::from);
    }

    private void validateStoreOwnership(Long ownerId, Long storeId) {
        storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
    }
}
