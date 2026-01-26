package com.project.kkookk.service.store;

import com.project.kkookk.controller.store.dto.StoreCreateRequest;
import com.project.kkookk.controller.store.dto.StoreResponse;
import com.project.kkookk.controller.store.dto.StoreUpdateRequest;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.repository.store.StoreRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StoreService {

    private final StoreRepository storeRepository;

    public StoreService(final StoreRepository storeRepository) {
        this.storeRepository = storeRepository;
    }

    @Transactional
    public StoreResponse createStore(final Long ownerId, final StoreCreateRequest request) {
        final Store store =
                new Store(
                        request.name(),
                        request.address(),
                        request.phone(),
                        request.status(),
                        ownerId);

        final Store savedStore = storeRepository.save(store);
        return StoreResponse.from(savedStore);
    }

    public List<StoreResponse> getStores(final Long ownerId) {
        return storeRepository.findByOwnerAccountId(ownerId).stream()
                .map(StoreResponse::from)
                .toList();
    }

    public StoreResponse getStore(final Long ownerId, final Long storeId) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        return StoreResponse.from(store);
    }

    @Transactional
    public StoreResponse updateStore(
            final Long ownerId, final Long storeId, final StoreUpdateRequest request) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        store.update(request.name(), request.address(), request.phone(), request.status());
        return StoreResponse.from(store);
    }

    @Transactional
    public void deleteStore(final Long ownerId, final Long storeId) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        storeRepository.delete(store);
    }

    private Store findStoreByIdAndOwnerId(final Long storeId, final Long ownerId) {
        return storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
    }
}
