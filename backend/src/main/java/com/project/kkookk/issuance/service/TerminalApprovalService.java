package com.project.kkookk.issuance.service;

import com.project.kkookk.issuance.controller.dto.IssuanceApprovalResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRejectionResponse;
import com.project.kkookk.issuance.controller.dto.PendingIssuanceRequestItem;
import com.project.kkookk.issuance.controller.dto.PendingIssuanceRequestListResponse;
import com.project.kkookk.issuance.domain.IssuanceRequest;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import com.project.kkookk.issuance.repository.IssuanceRequestRepository;
import com.project.kkookk.issuance.service.exception.IssuanceAlreadyProcessedException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestExpiredException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestNotFoundException;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import com.project.kkookk.store.service.exception.TerminalAccessDeniedException;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class TerminalApprovalService {

    private static final int STAMP_DELTA = 1;

    private final IssuanceRequestRepository issuanceRequestRepository;
    private final StoreRepository storeRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StampEventRepository stampEventRepository;

    /**
     * 승인 대기 목록 조회 (터미널 Polling용)
     */
    public PendingIssuanceRequestListResponse getPendingRequests(Long storeId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);

        List<IssuanceRequest> pendingRequests =
                issuanceRequestRepository.findByStoreIdAndStatus(
                        storeId, IssuanceRequestStatus.PENDING);

        // 만료된 요청은 필터링 (lazy expiration)
        LocalDateTime now = LocalDateTime.now();
        List<IssuanceRequest> validRequests =
                pendingRequests.stream()
                        .filter(r -> !r.isExpired())
                        .toList();

        // 고객명 조회 (N+1 방지)
        Set<Long> walletIds =
                validRequests.stream()
                        .map(IssuanceRequest::getWalletId)
                        .collect(Collectors.toSet());

        Map<Long, String> walletNameMap =
                customerWalletRepository.findAllByIds(walletIds).stream()
                        .collect(Collectors.toMap(CustomerWallet::getId, CustomerWallet::getName));

        List<PendingIssuanceRequestItem> items =
                validRequests.stream()
                        .map(r -> toItem(r, walletNameMap.getOrDefault(r.getWalletId(), "알 수 없음"), now))
                        .toList();

        return new PendingIssuanceRequestListResponse(items, items.size());
    }

    /**
     * 적립 요청 승인
     */
    @Transactional
    public IssuanceApprovalResponse approveRequest(Long storeId, Long requestId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);

        IssuanceRequest request =
                issuanceRequestRepository
                        .findByIdWithLock(requestId)
                        .orElseThrow(IssuanceRequestNotFoundException::new);

        validateRequestBelongsToStore(request, storeId);
        validateRequestCanBeProcessed(request);

        // 상태 변경
        request.approve();

        // 스탬프 적립
        WalletStampCard walletStampCard =
                walletStampCardRepository
                        .findById(request.getWalletStampCardId())
                        .orElseThrow(WalletStampCardNotFoundException::new);

        walletStampCard.addStamps(STAMP_DELTA);

        // 원장 기록
        StampEvent stampEvent =
                StampEvent.builder()
                        .storeId(storeId)
                        .stampCardId(walletStampCard.getStampCardId())
                        .walletStampCardId(walletStampCard.getId())
                        .type(StampEventType.ISSUED)
                        .delta(STAMP_DELTA)
                        .reason("터미널 승인")
                        .occurredAt(LocalDateTime.now())
                        .issuanceRequestId(requestId)
                        .build();

        stampEventRepository.save(stampEvent);

        log.info(
                "Issuance approved: requestId={}, storeId={}, walletId={}, newStampCount={}",
                requestId,
                storeId,
                request.getWalletId(),
                walletStampCard.getStampCount());

        return new IssuanceApprovalResponse(
                request.getId(),
                request.getStatus(),
                request.getApprovedAt(),
                STAMP_DELTA,
                walletStampCard.getStampCount());
    }

    /**
     * 적립 요청 거절
     */
    @Transactional
    public IssuanceRejectionResponse rejectRequest(Long storeId, Long requestId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);

        IssuanceRequest request =
                issuanceRequestRepository
                        .findByIdWithLock(requestId)
                        .orElseThrow(IssuanceRequestNotFoundException::new);

        validateRequestBelongsToStore(request, storeId);
        validateRequestCanBeProcessed(request);

        // 상태 변경
        request.reject();

        log.info(
                "Issuance rejected: requestId={}, storeId={}, walletId={}",
                requestId,
                storeId,
                request.getWalletId());

        return new IssuanceRejectionResponse(
                request.getId(), request.getStatus(), LocalDateTime.now());
    }

    private void validateStoreOwnership(Long storeId, Long ownerId) {
        storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(
                        () -> {
                            if (!storeRepository.existsById(storeId)) {
                                return new StoreNotFoundException();
                            }
                            return new TerminalAccessDeniedException();
                        });
    }

    private void validateRequestBelongsToStore(IssuanceRequest request, Long storeId) {
        if (!request.getStoreId().equals(storeId)) {
            throw new TerminalAccessDeniedException();
        }
    }

    private void validateRequestCanBeProcessed(IssuanceRequest request) {
        if (!request.isPending()) {
            throw new IssuanceAlreadyProcessedException();
        }
        if (request.isExpired()) {
            request.expire();
            throw new IssuanceRequestExpiredException();
        }
    }

    private PendingIssuanceRequestItem toItem(
            IssuanceRequest request, String customerName, LocalDateTime now) {
        long elapsedSeconds = Duration.between(request.getCreatedAt(), now).getSeconds();
        long remainingSeconds = Duration.between(now, request.getExpiresAt()).getSeconds();

        return new PendingIssuanceRequestItem(
                request.getId(),
                customerName,
                request.getCreatedAt(),
                Math.max(0, elapsedSeconds),
                Math.max(0, remainingSeconds));
    }
}
