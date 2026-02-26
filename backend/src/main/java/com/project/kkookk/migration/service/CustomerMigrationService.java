package com.project.kkookk.migration.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.image.ImageProcessingService;
import com.project.kkookk.global.logging.FlowMdc;
import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import com.project.kkookk.migration.dto.CreateMigrationRequest;
import com.project.kkookk.migration.dto.MigrationListItemResponse;
import com.project.kkookk.migration.dto.MigrationRequestResponse;
import com.project.kkookk.migration.repository.StampMigrationRequestRepository;
import com.project.kkookk.migration.service.exception.MigrationAccessDeniedException;
import com.project.kkookk.migration.service.exception.MigrationAlreadyPendingException;
import com.project.kkookk.migration.service.exception.MigrationImageTooLargeException;
import com.project.kkookk.migration.service.exception.MigrationRequestNotFoundException;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerMigrationService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    private final StampMigrationRequestRepository migrationRequestRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final StoreRepository storeRepository;
    private final ImageProcessingService imageProcessingService;

    @Transactional
    public MigrationRequestResponse createMigrationRequest(
            Long customerWalletId, CreateMigrationRequest request, MultipartFile image) {

        // 1. 이미지 크기 검증 (5MB 제한)
        if (image.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new MigrationImageTooLargeException();
        }

        // 2. 고객 지갑 조회 및 검증
        CustomerWallet customerWallet =
                customerWalletRepository
                        .findById(customerWalletId)
                        .orElseThrow(CustomerWalletNotFoundException::new);

        if (customerWallet.isBlocked()) {
            throw new CustomerWalletBlockedException();
        }

        // 3. 매장 존재 확인
        if (!storeRepository.existsById(request.storeId())) {
            throw new StoreNotFoundException();
        }

        // 4. 중복 요청 방지 (동일 지갑 + 매장에 대해 SUBMITTED 상태 확인)
        boolean hasPendingRequest =
                migrationRequestRepository.existsByCustomerWalletIdAndStoreIdAndStatus(
                        customerWalletId, request.storeId(), StampMigrationStatus.SUBMITTED);

        if (hasPendingRequest) {
            throw new MigrationAlreadyPendingException();
        }

        // 5. 이미지 처리 및 저장 (리사이즈 + 썸네일 생성)
        String imageKey;
        try {
            imageKey = imageProcessingService.processAndStore("migrations", image.getInputStream());
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }

        // 6. 마이그레이션 요청 생성
        StampMigrationRequest migrationRequest =
                StampMigrationRequest.builder()
                        .customerWalletId(customerWalletId)
                        .storeId(request.storeId())
                        .imageKey(imageKey)
                        .claimedStampCount(request.claimedStampCount())
                        .build();

        StampMigrationRequest savedRequest = migrationRequestRepository.save(migrationRequest);

        FlowMdc.setMigrationFlow(savedRequest.getId());
        log.info(
                "[Migration] Request created id={} walletId={} storeId={}",
                savedRequest.getId(),
                customerWalletId,
                request.storeId());

        String imageUrl = imageProcessingService.getUrl(imageKey);
        return MigrationRequestResponse.from(savedRequest, imageUrl);
    }

    public MigrationRequestResponse getMigrationRequest(Long customerWalletId, Long migrationId) {
        FlowMdc.setMigrationFlow(migrationId);

        // 본인 소유의 마이그레이션 요청만 조회 가능
        StampMigrationRequest migrationRequest =
                migrationRequestRepository
                        .findByIdAndCustomerWalletId(migrationId, customerWalletId)
                        .orElseThrow(
                                () -> {
                                    // ID는 존재하지만 본인 소유가 아닌 경우 접근 거부
                                    if (migrationRequestRepository.existsById(migrationId)) {
                                        throw new MigrationAccessDeniedException();
                                    }
                                    // ID 자체가 존재하지 않는 경우
                                    throw new MigrationRequestNotFoundException();
                                });

        String imageUrl = imageProcessingService.getUrl(migrationRequest.getImageKey());
        return MigrationRequestResponse.from(migrationRequest, imageUrl);
    }

    public List<MigrationListItemResponse> getMyMigrationRequests(Long customerWalletId) {
        List<StampMigrationRequest> requests =
                migrationRequestRepository.findByCustomerWalletIdOrderByRequestedAtDesc(
                        customerWalletId);

        Set<Long> storeIds =
                requests.stream()
                        .map(StampMigrationRequest::getStoreId)
                        .collect(Collectors.toSet());

        Map<Long, String> storeNameMap =
                storeRepository.findAllById(storeIds).stream()
                        .collect(Collectors.toMap(Store::getId, Store::getName));

        return requests.stream()
                .map(r -> MigrationListItemResponse.from(r, storeNameMap.get(r.getStoreId())))
                .toList();
    }
}
