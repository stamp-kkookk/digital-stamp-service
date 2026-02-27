package com.project.kkookk.migration.service;

import com.project.kkookk.global.event.DomainEventPublisher;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.logging.FlowMdc;
import com.project.kkookk.migration.controller.dto.MigrationApproveRequest;
import com.project.kkookk.migration.controller.dto.MigrationApproveResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse.MigrationSummary;
import com.project.kkookk.migration.controller.dto.MigrationRejectRequest;
import com.project.kkookk.migration.controller.dto.MigrationRejectResponse;
import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import com.project.kkookk.migration.event.StampMigratedEvent;
import com.project.kkookk.migration.repository.StampMigrationRequestRepository;
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
    private final StoreRepository storeRepository;
    private final StampRewardService stampRewardService;
    private final DomainEventPublisher domainEventPublisher;

    public OwnerMigrationService(
            StampMigrationRequestRepository migrationRepository,
            CustomerWalletRepository customerWalletRepository,
            WalletStampCardRepository walletStampCardRepository,
            StampCardRepository stampCardRepository,
            StoreRepository storeRepository,
            StampRewardService stampRewardService,
            DomainEventPublisher domainEventPublisher) {
        this.migrationRepository = migrationRepository;
        this.customerWalletRepository = customerWalletRepository;
        this.walletStampCardRepository = walletStampCardRepository;
        this.stampCardRepository = stampCardRepository;
        this.storeRepository = storeRepository;
        this.stampRewardService = stampRewardService;
        this.domainEventPublisher = domainEventPublisher;
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
        StampMigrationRequest migration = findMigrationByIdAndStoreIdWithLock(migrationId, storeId);

        FlowMdc.setMigrationFlow(migrationId);

        if (!migration.isSubmitted()) {
            throw new BusinessException(ErrorCode.MIGRATION_ALREADY_PROCESSED);
        }

        int stampCount = request.approvedStampCount();

        // 고객의 ACTIVE WalletStampCard 조회 (비관적 락으로 동시성 제어)
        WalletStampCard walletStampCard =
                walletStampCardRepository
                        .findByCustomerWalletIdAndStoreIdAndStatusWithLock(
                                migration.getCustomerWalletId(),
                                storeId,
                                WalletStampCardStatus.ACTIVE)
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.WALLET_STAMP_CARD_NOT_FOUND));

        // 고객이 적립 중인 원본 스탬프카드 조회 (리워드 기준)
        StampCard linkedStampCard =
                stampCardRepository
                        .findById(walletStampCard.getStampCardId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.STAMP_CARD_NOT_FOUND));

        // 현재 ACTIVE 스탬프카드 조회 (완료 후 새 카드 생성용, 없으면 원본 사용)
        StampCard activeStampCard =
                stampCardRepository
                        .findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                storeId, StampCardStatus.ACTIVE)
                        .orElse(linkedStampCard);

        // 스탬프 적립 및 리워드 발급 처리
        StampRewardService.StampAccumulationResult result =
                stampRewardService.processStampAccumulation(
                        walletStampCard, linkedStampCard, activeStampCard, stampCount);

        // Migration 승인 처리
        migration.approve(stampCount);

        // 이벤트 발행 → StampAuditEventListener가 원장 기록
        domainEventPublisher.publish(
                new StampMigratedEvent(
                        migration.getId(),
                        storeId,
                        linkedStampCard.getId(),
                        result.currentWalletStampCard().getId(),
                        stampCount,
                        "종이 스탬프 전환 승인"));

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
        StampMigrationRequest migration = findMigrationByIdAndStoreIdWithLock(migrationId, storeId);

        if (!migration.isSubmitted()) {
            throw new BusinessException(ErrorCode.MIGRATION_ALREADY_PROCESSED);
        }

        migration.reject(request.rejectReason());

        FlowMdc.setMigrationFlow(migrationId);
        log.info("[Migration] Rejected id={} reason={}", migrationId, request.rejectReason());

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

    private StampMigrationRequest findMigrationByIdAndStoreIdWithLock(
            Long migrationId, Long storeId) {
        return migrationRepository
                .findByIdAndStoreIdWithLock(migrationId, storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MIGRATION_NOT_FOUND));
    }

    private void validateStoreOwnership(Long storeId, Long ownerId) {
        storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED));
    }
}
