package com.project.kkookk.migration.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.migration.controller.dto.MigrationApproveRequest;
import com.project.kkookk.migration.controller.dto.MigrationApproveResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse.MigrationSummary;
import com.project.kkookk.migration.controller.dto.MigrationRejectRequest;
import com.project.kkookk.migration.controller.dto.MigrationRejectResponse;
import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import com.project.kkookk.migration.repository.StampMigrationRequestRepository;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.stamp.service.StampRewardService;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.domain.WalletStampCardStatus;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
public class OwnerMigrationService {

    private final StampMigrationRequestRepository migrationRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StampCardRepository stampCardRepository;
    private final StampEventRepository stampEventRepository;
    private final StoreRepository storeRepository;
    private final StampRewardService stampRewardService;

    public OwnerMigrationService(
            StampMigrationRequestRepository migrationRepository,
            CustomerWalletRepository customerWalletRepository,
            WalletStampCardRepository walletStampCardRepository,
            StampCardRepository stampCardRepository,
            StampEventRepository stampEventRepository,
            StoreRepository storeRepository,
            StampRewardService stampRewardService) {
        this.migrationRepository = migrationRepository;
        this.customerWalletRepository = customerWalletRepository;
        this.walletStampCardRepository = walletStampCardRepository;
        this.stampCardRepository = stampCardRepository;
        this.stampEventRepository = stampEventRepository;
        this.storeRepository = storeRepository;
        this.stampRewardService = stampRewardService;
    }

    public MigrationListResponse getList(Long storeId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);

        List<StampMigrationRequest> migrations =
                migrationRepository.findByStoreIdAndStatusOrderByRequestedAtDesc(
                        storeId, StampMigrationStatus.SUBMITTED);

        Set<Long> walletIds =
                migrations.stream()
                        .map(StampMigrationRequest::getCustomerWalletId)
                        .collect(Collectors.toSet());

        Map<Long, CustomerWallet> walletMap =
                customerWalletRepository.findAllByIds(walletIds).stream()
                        .collect(Collectors.toMap(CustomerWallet::getId, w -> w));

        List<MigrationSummary> summaries =
                migrations.stream()
                        .map(
                                m -> {
                                    CustomerWallet wallet = walletMap.get(m.getCustomerWalletId());
                                    return new MigrationSummary(
                                            m.getId(),
                                            wallet != null ? wallet.getPhone() : null,
                                            wallet != null ? wallet.getName() : null,
                                            m.getClaimedStampCount(),
                                            m.getStatus().name(),
                                            m.getRequestedAt());
                                })
                        .toList();

        return new MigrationListResponse(summaries);
    }

    public MigrationDetailResponse getDetail(Long storeId, Long migrationId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);
        StampMigrationRequest migration = findMigrationByIdAndStoreId(migrationId, storeId);

        CustomerWallet wallet =
                customerWalletRepository.findById(migration.getCustomerWalletId()).orElse(null);

        return new MigrationDetailResponse(
                migration.getId(),
                migration.getCustomerWalletId(),
                wallet != null ? wallet.getPhone() : null,
                wallet != null ? wallet.getName() : null,
                migration.getImageData(),
                migration.getClaimedStampCount(),
                migration.getStatus().name(),
                migration.getApprovedStampCount(),
                migration.getRejectReason(),
                migration.getRequestedAt(),
                migration.getProcessedAt());
    }

    @Transactional
    public MigrationApproveResponse approve(
            Long storeId, Long migrationId, MigrationApproveRequest request, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);
        StampMigrationRequest migration = findMigrationByIdAndStoreId(migrationId, storeId);

        if (!migration.isSubmitted()) {
            throw new BusinessException(ErrorCode.MIGRATION_ALREADY_PROCESSED);
        }

        int stampCount = request.approvedStampCount();

        // Store의 ACTIVE StampCard 조회
        StampCard activeStampCard =
                stampCardRepository
                        .findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                storeId, StampCardStatus.ACTIVE)
                        .orElseThrow(() -> new BusinessException(ErrorCode.NO_ACTIVE_STAMP_CARD));

        // 고객의 ACTIVE WalletStampCard 조회 (비관적 락으로 동시성 제어)
        WalletStampCard walletStampCard =
                walletStampCardRepository
                        .findByCustomerWalletIdAndStoreIdAndStatusWithLock(
                                migration.getCustomerWalletId(),
                                storeId,
                                WalletStampCardStatus.ACTIVE)
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.WALLET_STAMP_CARD_NOT_FOUND));

        // 스탬프 적립 및 리워드 발급 처리
        StampRewardService.StampAccumulationResult result =
                stampRewardService.processStampAccumulation(
                        walletStampCard, activeStampCard, stampCount);

        // Migration 승인 처리
        migration.approve(stampCount);

        // StampEvent 원장 기록
        StampEvent stampEvent =
                StampEvent.builder()
                        .storeId(storeId)
                        .stampCardId(activeStampCard.getId())
                        .walletStampCardId(result.currentWalletStampCard().getId())
                        .type(StampEventType.MIGRATED)
                        .delta(stampCount)
                        .reason("마이그레이션 승인")
                        .occurredAt(LocalDateTime.now())
                        .stampMigrationRequestId(migration.getId())
                        .build();
        stampEventRepository.save(stampEvent);

        log.info(
                "Migration approved: migrationId={}, storeId={}, stampCount={}, "
                        + "newStampCount={}, rewardsIssued={}",
                migrationId,
                storeId,
                stampCount,
                result.currentWalletStampCard().getStampCount(),
                result.rewardCount());

        return new MigrationApproveResponse(
                migration.getId(),
                migration.getStatus().name(),
                migration.getApprovedStampCount(),
                migration.getProcessedAt());
    }

    @Transactional
    public MigrationRejectResponse reject(
            Long storeId, Long migrationId, MigrationRejectRequest request, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);
        StampMigrationRequest migration = findMigrationByIdAndStoreId(migrationId, storeId);

        if (!migration.isSubmitted()) {
            throw new BusinessException(ErrorCode.MIGRATION_ALREADY_PROCESSED);
        }

        migration.reject(request.rejectReason());

        return new MigrationRejectResponse(
                migration.getId(),
                migration.getStatus().name(),
                migration.getRejectReason(),
                migration.getProcessedAt());
    }

    private StampMigrationRequest findMigrationByIdAndStoreId(Long migrationId, Long storeId) {
        return migrationRepository
                .findByIdAndStoreId(migrationId, storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MIGRATION_NOT_FOUND));
    }

    private void validateStoreOwnership(Long storeId, Long ownerId) {
        storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED));
    }
}
