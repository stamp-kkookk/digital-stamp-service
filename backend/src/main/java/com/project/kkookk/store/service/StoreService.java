package com.project.kkookk.store.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.PhoneValidator;
import com.project.kkookk.store.controller.owner.dto.StoreCreateRequest;
import com.project.kkookk.store.controller.owner.dto.StoreResponse;
import com.project.kkookk.store.controller.owner.dto.StoreUpdateRequest;
import com.project.kkookk.store.domain.PerformerType;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreAuditAction;
import com.project.kkookk.store.domain.StoreAuditLog;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreAuditLogRepository;
import com.project.kkookk.store.repository.StoreRepository;
import java.util.List;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class StoreService {

    private static final int MAX_ICON_BASE64_LENGTH = 5 * 1024 * 1024 * 4 / 3;

    private final StoreRepository storeRepository;
    private final StoreAuditLogRepository storeAuditLogRepository;

    public StoreService(
            final StoreRepository storeRepository,
            final StoreAuditLogRepository storeAuditLogRepository) {
        this.storeRepository = storeRepository;
        this.storeAuditLogRepository = storeAuditLogRepository;
    }

    @Transactional
    public StoreResponse createStore(final Long ownerId, final StoreCreateRequest request) {
        validatePhone(request.phone());
        validateIconSize(request.iconImageBase64());
        validatePlaceRefUnique(request.placeRef());

        final Store store =
                new Store(
                        request.name(),
                        request.address(),
                        request.phone(),
                        request.placeRef(),
                        request.iconImageBase64(),
                        request.description(),
                        ownerId);

        final Store savedStore = storeRepository.save(store);

        storeAuditLogRepository.save(
                StoreAuditLog.builder()
                        .storeId(savedStore.getId())
                        .action(StoreAuditAction.CREATED)
                        .newStatus(StoreStatus.DRAFT)
                        .performedBy(ownerId)
                        .performedByType(PerformerType.OWNER)
                        .build());

        log.info(
                "[Store] Created id={} ownerId={} name={}",
                savedStore.getId(),
                ownerId,
                request.name());
        return StoreResponse.from(savedStore);
    }

    public List<StoreResponse> getStores(final Long ownerId) {
        return storeRepository
                .findByOwnerAccountIdAndStatusNot(ownerId, StoreStatus.DELETED)
                .stream()
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

        if (store.getStatus() == StoreStatus.SUSPENDED
                || store.getStatus() == StoreStatus.DELETED) {
            throw new BusinessException(ErrorCode.STORE_NOT_OPERATIONAL);
        }

        validateIconSize(request.iconImageBase64());

        if (store.isLive()) {
            validateLiveStoreRestrictedFields(store, request);
            store.updatePartial(request.description(), request.iconImageBase64());
        } else {
            validatePhone(request.phone());
            validatePlaceRefUniqueForUpdate(request.placeRef(), storeId);
            store.updateInfo(
                    request.name(),
                    request.address(),
                    request.phone(),
                    request.description(),
                    request.iconImageBase64(),
                    request.placeRef());
        }

        storeAuditLogRepository.save(
                StoreAuditLog.builder()
                        .storeId(storeId)
                        .action(StoreAuditAction.UPDATED)
                        .previousStatus(store.getStatus())
                        .newStatus(store.getStatus())
                        .performedBy(ownerId)
                        .performedByType(PerformerType.OWNER)
                        .build());

        log.info("[Store] Updated id={}", storeId);
        return StoreResponse.from(store);
    }

    @Transactional
    public void deleteStore(final Long ownerId, final Long storeId) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        StoreStatus previousStatus = store.getStatus();
        store.transitionTo(StoreStatus.DELETED);

        storeAuditLogRepository.save(
                StoreAuditLog.builder()
                        .storeId(storeId)
                        .action(StoreAuditAction.DELETED)
                        .previousStatus(previousStatus)
                        .newStatus(StoreStatus.DELETED)
                        .performedBy(ownerId)
                        .performedByType(PerformerType.OWNER)
                        .build());

        log.info("[Store] Soft-deleted id={}", storeId);
    }

    private Store findStoreByIdAndOwnerId(final Long storeId, final Long ownerId) {
        return storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));
    }

    private void validatePhone(String phone) {
        if (!PhoneValidator.isValid(phone)) {
            throw new BusinessException(ErrorCode.STORE_PHONE_INVALID);
        }
    }

    private void validateIconSize(String iconImageBase64) {
        if (iconImageBase64 != null && iconImageBase64.length() > MAX_ICON_BASE64_LENGTH) {
            throw new BusinessException(ErrorCode.STORE_ICON_TOO_LARGE);
        }
    }

    private void validatePlaceRefUnique(String placeRef) {
        if (placeRef != null && !placeRef.isBlank() && storeRepository.existsByPlaceRef(placeRef)) {
            throw new BusinessException(ErrorCode.STORE_PLACE_REF_DUPLICATED);
        }
    }

    private void validateLiveStoreRestrictedFields(Store store, StoreUpdateRequest request) {
        boolean restricted =
                !Objects.equals(store.getName(), request.name())
                        || !Objects.equals(store.getAddress(), request.address())
                        || !Objects.equals(store.getPhone(), request.phone())
                        || !Objects.equals(store.getPlaceRef(), request.placeRef());
        if (restricted) {
            throw new BusinessException(ErrorCode.STORE_UPDATE_NOT_ALLOWED);
        }
    }

    private void validatePlaceRefUniqueForUpdate(String placeRef, Long storeId) {
        if (placeRef != null
                && !placeRef.isBlank()
                && storeRepository.existsByPlaceRefAndIdNot(placeRef, storeId)) {
            throw new BusinessException(ErrorCode.STORE_PLACE_REF_DUPLICATED);
        }
    }
}
