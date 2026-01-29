package com.project.kkookk.store.service;

import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.dto.response.StorePublicInfoResponse;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreInactiveException;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StorePublicService {

    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;

    public StorePublicInfoResponse getStorePublicInfo(Long storeId) {
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new StoreNotFoundException("매장을 찾을 수 없습니다"));

        if (!store.getStatus().equals(StoreStatus.ACTIVE)) {
            throw new StoreInactiveException("해당 매장은 현재 이용할 수 없습니다");
        }

        int activeCardCount =
                stampCardRepository.countByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);

        return StorePublicInfoResponse.of(store, activeCardCount);
    }
}
