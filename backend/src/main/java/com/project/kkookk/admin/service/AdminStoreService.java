package com.project.kkookk.admin.service;

import com.project.kkookk.admin.controller.dto.AdminStoreResponse;
import com.project.kkookk.admin.controller.dto.AdminStoreStatusChangeRequest;
import com.project.kkookk.admin.controller.dto.StoreAuditLogResponse;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.image.ImageProcessingService;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.PerformerType;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreAuditAction;
import com.project.kkookk.store.domain.StoreAuditLog;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreAuditLogRepository;
import com.project.kkookk.store.repository.StoreRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStoreService {

    private final StoreRepository storeRepository;
    private final OwnerAccountRepository ownerAccountRepository;
    private final StoreAuditLogRepository storeAuditLogRepository;
    private final StampCardRepository stampCardRepository;
    private final ImageProcessingService imageProcessingService;

    public List<AdminStoreResponse> getAllStores(StoreStatus statusFilter) {
        List<Store> stores;
        if (statusFilter != null) {
            stores = storeRepository.findByStatus(statusFilter);
        } else {
            stores = storeRepository.findAll();
        }

        return stores.stream()
                .map(
                        store -> {
                            OwnerAccount owner =
                                    ownerAccountRepository
                                            .findById(store.getOwnerAccountId())
                                            .orElse(null);
                            boolean hasActiveStampCard =
                                    stampCardRepository.existsByStoreIdAndStatus(
                                            store.getId(), StampCardStatus.ACTIVE);
                            return AdminStoreResponse.of(
                                    store,
                                    owner,
                                    hasActiveStampCard,
                                    getIconUrl(store),
                                    getIconThumbnailUrl(store));
                        })
                .toList();
    }

    public AdminStoreResponse getStore(Long storeId) {
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        OwnerAccount owner =
                ownerAccountRepository.findById(store.getOwnerAccountId()).orElse(null);
        boolean hasActiveStampCard =
                stampCardRepository.existsByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);

        return AdminStoreResponse.of(
                store, owner, hasActiveStampCard, getIconUrl(store), getIconThumbnailUrl(store));
    }

    @Transactional
    public AdminStoreResponse changeStoreStatus(
            Long storeId, Long adminId, AdminStoreStatusChangeRequest request) {
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        StoreStatus previousStatus = store.getStatus();
        store.transitionTo(request.status());

        StoreAuditAction action = resolveAuditAction(previousStatus, request.status());

        storeAuditLogRepository.save(
                StoreAuditLog.builder()
                        .storeId(storeId)
                        .action(action)
                        .previousStatus(previousStatus)
                        .newStatus(request.status())
                        .performedBy(adminId)
                        .performedByType(PerformerType.ADMIN)
                        .detail(request.reason())
                        .build());

        log.info(
                "[Admin] Store status changed id={} {} -> {} by adminId={}",
                storeId,
                previousStatus,
                request.status(),
                adminId);

        OwnerAccount owner =
                ownerAccountRepository.findById(store.getOwnerAccountId()).orElse(null);
        boolean hasActiveStampCard =
                stampCardRepository.existsByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);

        return AdminStoreResponse.of(
                store, owner, hasActiveStampCard, getIconUrl(store), getIconThumbnailUrl(store));
    }

    public List<StoreAuditLogResponse> getAuditLogs(Long storeId) {
        storeRepository
                .findById(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        return storeAuditLogRepository.findByStoreIdOrderByCreatedAtDesc(storeId).stream()
                .map(StoreAuditLogResponse::from)
                .toList();
    }

    private String getIconUrl(Store store) {
        if (store.getIconImageKey() == null) {
            return null;
        }
        return imageProcessingService.getUrl(store.getIconImageKey());
    }

    private String getIconThumbnailUrl(Store store) {
        if (store.getIconImageKey() == null) {
            return null;
        }
        return imageProcessingService.getThumbnailUrl(store.getIconImageKey());
    }

    private StoreAuditAction resolveAuditAction(StoreStatus previousStatus, StoreStatus newStatus) {
        if (newStatus == StoreStatus.LIVE && previousStatus == StoreStatus.DRAFT) {
            return StoreAuditAction.APPROVED;
        }
        if (newStatus == StoreStatus.LIVE && previousStatus == StoreStatus.SUSPENDED) {
            return StoreAuditAction.UNSUSPENDED;
        }
        if (newStatus == StoreStatus.SUSPENDED) {
            return StoreAuditAction.SUSPENDED;
        }
        if (newStatus == StoreStatus.DELETED) {
            return StoreAuditAction.DELETED;
        }
        return StoreAuditAction.UPDATED;
    }
}
