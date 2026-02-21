package com.project.kkookk.store.service;

import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.dto.response.StoreListItemResponse;
import com.project.kkookk.store.dto.response.StorePublicInfoResponse;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreInactiveException;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import com.project.kkookk.wallet.domain.WalletStampCardStatus;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StorePublicService {

    private final StoreRepository storeRepository;
    private final WalletStampCardRepository walletStampCardRepository;

    public StorePublicInfoResponse getStorePublicInfo(Long storeId) {
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new StoreNotFoundException("매장을 찾을 수 없습니다"));

        if (!store.getStatus().isOperational()) {
            throw new StoreInactiveException("해당 매장은 현재 이용할 수 없습니다");
        }

        int walletStampCardCount =
                walletStampCardRepository.countByStoreIdAndStatus(
                        storeId, WalletStampCardStatus.ACTIVE);

        return StorePublicInfoResponse.of(store, walletStampCardCount);
    }

    public List<StoreListItemResponse> getAllActiveStores() {
        return storeRepository.findByStatus(StoreStatus.LIVE).stream()
                .map(StoreListItemResponse::from)
                .toList();
    }
}
