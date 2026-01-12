package com.kkookk.store.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.owner.entity.OwnerAccount;
import com.kkookk.owner.repository.OwnerAccountRepository;
import com.kkookk.store.dto.CreateStoreRequest;
import com.kkookk.store.dto.StoreResponse;
import com.kkookk.store.dto.UpdateStoreRequest;
import com.kkookk.store.entity.Store;
import com.kkookk.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final OwnerAccountRepository ownerAccountRepository;

    @Transactional(readOnly = true)
    public List<StoreResponse> getStoresByOwner(Long ownerId) {
        return storeRepository.findByOwnerId(ownerId).stream()
                .map(StoreResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StoreResponse getStore(Long storeId, Long ownerId) {
        Store store = findStoreById(storeId);
        validateOwnership(store, ownerId);
        return StoreResponse.from(store);
    }

    @Transactional
    public StoreResponse createStore(CreateStoreRequest request, Long ownerId) {
        OwnerAccount owner = ownerAccountRepository.findById(ownerId)
                .orElseThrow(() -> new BusinessException(
                        "A003",
                        "사장님 계정을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        Store store = Store.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .build();

        store = storeRepository.save(store);
        return StoreResponse.from(store);
    }

    @Transactional
    public StoreResponse updateStore(Long storeId, UpdateStoreRequest request, Long ownerId) {
        Store store = findStoreById(storeId);
        validateOwnership(store, ownerId);

        if (request.getName() != null) {
            store.setName(request.getName());
        }
        if (request.getDescription() != null) {
            store.setDescription(request.getDescription());
        }
        if (request.getAddress() != null) {
            store.setAddress(request.getAddress());
        }
        if (request.getPhoneNumber() != null) {
            store.setPhoneNumber(request.getPhoneNumber());
        }

        store = storeRepository.save(store);
        return StoreResponse.from(store);
    }

    @Transactional
    public void deleteStore(Long storeId, Long ownerId) {
        Store store = findStoreById(storeId);
        validateOwnership(store, ownerId);
        storeRepository.delete(store);
    }

    private Store findStoreById(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(
                        "S001",
                        "매장을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));
    }

    private void validateOwnership(Store store, Long ownerId) {
        if (!store.getOwner().getId().equals(ownerId)) {
            throw new BusinessException(
                    "S002",
                    "해당 매장에 접근할 권한이 없습니다.",
                    HttpStatus.FORBIDDEN
            );
        }
    }
}
