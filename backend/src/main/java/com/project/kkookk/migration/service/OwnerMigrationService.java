package com.project.kkookk.migration.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse.MigrationSummary;
import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import com.project.kkookk.migration.repository.StampMigrationRequestRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OwnerMigrationService {

    private final StampMigrationRequestRepository migrationRepository;
    private final CustomerWalletRepository customerWalletRepository;

    public OwnerMigrationService(
            StampMigrationRequestRepository migrationRepository,
            CustomerWalletRepository customerWalletRepository) {
        this.migrationRepository = migrationRepository;
        this.customerWalletRepository = customerWalletRepository;
    }

    public MigrationListResponse getList(Long storeId) {
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
                                            m.getImageUrl(),
                                            m.getStatus().name(),
                                            m.getRequestedAt());
                                })
                        .toList();

        return new MigrationListResponse(summaries);
    }

    public MigrationDetailResponse getDetail(Long storeId, Long migrationId) {
        StampMigrationRequest migration = findMigrationByIdAndStoreId(migrationId, storeId);

        CustomerWallet wallet =
                customerWalletRepository.findById(migration.getCustomerWalletId()).orElse(null);

        // requestedStampCount는 BE2에서 추가 예정, 현재는 null
        Integer requestedStampCount = null;

        return new MigrationDetailResponse(
                migration.getId(),
                migration.getCustomerWalletId(),
                wallet != null ? wallet.getPhone() : null,
                wallet != null ? wallet.getName() : null,
                migration.getImageUrl(),
                requestedStampCount,
                migration.getStatus().name(),
                migration.getApprovedStampCount(),
                migration.getRejectReason(),
                migration.getRequestedAt(),
                migration.getProcessedAt());
    }

    private StampMigrationRequest findMigrationByIdAndStoreId(Long migrationId, Long storeId) {
        return migrationRepository
                .findByIdAndStoreId(migrationId, storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.MIGRATION_NOT_FOUND));
    }
}
