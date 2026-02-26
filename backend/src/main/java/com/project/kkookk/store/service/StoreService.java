package com.project.kkookk.store.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.image.ImageProcessingService;
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
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Transactional(readOnly = true)
public class StoreService {

    private static final long MAX_ICON_SIZE_BYTES = 5 * 1024 * 1024;

    private final StoreRepository storeRepository;
    private final StoreAuditLogRepository storeAuditLogRepository;
    private final ImageProcessingService imageProcessingService;

    public StoreService(
            final StoreRepository storeRepository,
            final StoreAuditLogRepository storeAuditLogRepository,
            final ImageProcessingService imageProcessingService) {
        this.storeRepository = storeRepository;
        this.storeAuditLogRepository = storeAuditLogRepository;
        this.imageProcessingService = imageProcessingService;
    }

    @Transactional
    public StoreResponse createStore(
            final Long ownerId, final StoreCreateRequest request, final MultipartFile iconImage) {
        validatePhone(request.phone());
        validatePlaceRefUnique(request.placeRef());

        String iconImageKey = uploadIcon(iconImage);

        final Store store =
                new Store(
                        request.name(),
                        request.address(),
                        request.phone(),
                        request.placeRef(),
                        iconImageKey,
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
        return toResponse(savedStore);
    }

    public List<StoreResponse> getStores(final Long ownerId) {
        return storeRepository
                .findByOwnerAccountIdAndStatusNot(ownerId, StoreStatus.DELETED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public StoreResponse getStore(final Long ownerId, final Long storeId) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);
        return toResponse(store);
    }

    @Transactional
    public StoreResponse updateStore(
            final Long ownerId,
            final Long storeId,
            final StoreUpdateRequest request,
            final MultipartFile iconImage) {
        final Store store = findStoreByIdAndOwnerId(storeId, ownerId);

        if (store.getStatus() == StoreStatus.SUSPENDED
                || store.getStatus() == StoreStatus.DELETED) {
            throw new BusinessException(ErrorCode.STORE_NOT_OPERATIONAL);
        }

        String newIconKey = uploadIcon(iconImage);
        String iconKeyToSet = newIconKey != null ? newIconKey : store.getIconImageKey();

        if (store.isLive()) {
            validateLiveStoreRestrictedFields(store, request);
            store.updatePartial(request.description(), iconKeyToSet);
        } else {
            validatePhone(request.phone());
            validatePlaceRefUniqueForUpdate(request.placeRef(), storeId);
            store.updateInfo(
                    request.name(),
                    request.address(),
                    request.phone(),
                    request.description(),
                    iconKeyToSet,
                    request.placeRef());
        }

        // 기존 이미지 삭제 (새 이미지가 업로드된 경우)
        if (newIconKey != null
                && store.getIconImageKey() != null
                && !newIconKey.equals(store.getIconImageKey())) {
            deleteIconSilently(store.getIconImageKey());
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
        return toResponse(store);
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

    public String getIconUrl(Store store) {
        if (store.getIconImageKey() == null) {
            return null;
        }
        return imageProcessingService.getUrl(store.getIconImageKey());
    }

    public String getIconThumbnailUrl(Store store) {
        if (store.getIconImageKey() == null) {
            return null;
        }
        return imageProcessingService.getThumbnailUrl(store.getIconImageKey());
    }

    private StoreResponse toResponse(Store store) {
        return StoreResponse.from(store, getIconUrl(store), getIconThumbnailUrl(store));
    }

    private String uploadIcon(MultipartFile iconImage) {
        if (iconImage == null || iconImage.isEmpty()) {
            return null;
        }
        validateIconSize(iconImage);
        try {
            return imageProcessingService.processAndStore(
                    "stores/icons", iconImage.getInputStream());
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    private void deleteIconSilently(String key) {
        try {
            imageProcessingService.deleteWithThumbnail(key);
        } catch (Exception e) {
            log.warn("[Store] 이미지 삭제 실패 key={}", key, e);
        }
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

    private void validateIconSize(MultipartFile iconImage) {
        if (iconImage.getSize() > MAX_ICON_SIZE_BYTES) {
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
