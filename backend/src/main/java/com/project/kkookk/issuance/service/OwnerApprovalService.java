package com.project.kkookk.issuance.service;

import com.project.kkookk.global.event.DomainEventPublisher;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.logging.FlowMdc;
import com.project.kkookk.issuance.controller.dto.IssuanceApprovalResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRejectionResponse;
import com.project.kkookk.issuance.controller.dto.PendingIssuanceRequestItem;
import com.project.kkookk.issuance.controller.dto.PendingIssuanceRequestListResponse;
import com.project.kkookk.issuance.domain.IssuanceRequest;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import com.project.kkookk.issuance.event.StampIssuedEvent;
import com.project.kkookk.issuance.repository.IssuanceRequestRepository;
import com.project.kkookk.issuance.service.exception.IssuanceAlreadyProcessedException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestExpiredException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestNotFoundException;
import com.project.kkookk.stamp.service.StampRewardService;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.domain.WalletStampCardStatus;
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
public class OwnerApprovalService {

    private static final int STAMP_DELTA = 1;

    private final IssuanceRequestRepository issuanceRequestRepository;
    private final StoreRepository storeRepository;
    private final CustomerWalletRepository customerWalletRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StampCardRepository stampCardRepository;
    private final StampRewardService stampRewardService;
    private final DomainEventPublisher domainEventPublisher;

    /** 승인 대기 목록 조회 (Owner Polling용) */
    public PendingIssuanceRequestListResponse getPendingRequests(Long storeId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);

        List<IssuanceRequest> pendingRequests =
                issuanceRequestRepository.findByStoreIdAndStatus(
                        storeId, IssuanceRequestStatus.PENDING);

        // 만료된 요청은 필터링 (lazy expiration)
        LocalDateTime now = LocalDateTime.now();
        List<IssuanceRequest> validRequests =
                pendingRequests.stream().filter(r -> !r.isExpired()).toList();

        // 고객 정보 조회 (N+1 방지)
        Set<Long> walletIds =
                validRequests.stream()
                        .map(IssuanceRequest::getWalletId)
                        .collect(Collectors.toSet());

        Map<Long, CustomerWallet> walletMap =
                customerWalletRepository.findAllByIds(walletIds).stream()
                        .collect(Collectors.toMap(CustomerWallet::getId, w -> w));

        List<PendingIssuanceRequestItem> items =
                validRequests.stream()
                        .map(r -> toItem(r, walletMap.get(r.getWalletId()), now))
                        .toList();

        log.info("[Issuance] Pending requests fetched storeId={} count={}", storeId, items.size());

        return new PendingIssuanceRequestListResponse(items, items.size());
    }

    /** 적립 요청 승인 */
    @Transactional
    public IssuanceApprovalResponse approveRequest(Long storeId, Long requestId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);

        IssuanceRequest request =
                issuanceRequestRepository
                        .findByIdWithLock(requestId)
                        .orElseThrow(IssuanceRequestNotFoundException::new);

        FlowMdc.setIssuanceFlow(requestId);

        validateRequestBelongsToStore(request, storeId);
        validateRequestCanBeProcessed(request);

        // 고객의 ACTIVE WalletStampCard 조회 (비관적 락으로 동시성 제어)
        WalletStampCard walletStampCard =
                walletStampCardRepository
                        .findByCustomerWalletIdAndStoreIdAndStatusWithLock(
                                request.getWalletId(), storeId, WalletStampCardStatus.ACTIVE)
                        .orElseThrow(WalletStampCardNotFoundException::new);

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
                        walletStampCard, linkedStampCard, activeStampCard, STAMP_DELTA);

        // 상태 변경 (발급된 리워드 개수 포함)
        request.approve(result.rewardCount());

        // 이벤트 발행 → StampAuditEventListener가 원장 기록
        domainEventPublisher.publish(
                new StampIssuedEvent(
                        requestId,
                        storeId,
                        linkedStampCard.getId(),
                        result.currentWalletStampCard().getId(),
                        STAMP_DELTA,
                        "현장 승인"));

        log.info(
                "Issuance approved: requestId={}, storeId={}, walletId={}, newStampCount={}, "
                        + "rewardsIssued={}",
                requestId,
                storeId,
                request.getWalletId(),
                result.currentWalletStampCard().getStampCount(),
                result.rewardCount());

        return new IssuanceApprovalResponse(
                request.getId(),
                request.getStatus(),
                request.getApprovedAt(),
                STAMP_DELTA,
                result.currentWalletStampCard().getStampCount());
    }

    /** 적립 요청 거절 */
    @Transactional
    public IssuanceRejectionResponse rejectRequest(Long storeId, Long requestId, Long ownerId) {
        validateStoreOwnership(storeId, ownerId);

        IssuanceRequest request =
                issuanceRequestRepository
                        .findByIdWithLock(requestId)
                        .orElseThrow(IssuanceRequestNotFoundException::new);

        FlowMdc.setIssuanceFlow(requestId);

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
                            return new BusinessException(ErrorCode.STORE_ACCESS_DENIED);
                        });
    }

    private void validateRequestBelongsToStore(IssuanceRequest request, Long storeId) {
        if (!request.getStoreId().equals(storeId)) {
            throw new BusinessException(ErrorCode.STORE_ACCESS_DENIED);
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
            IssuanceRequest request, CustomerWallet wallet, LocalDateTime now) {
        long elapsedSeconds = Duration.between(request.getCreatedAt(), now).getSeconds();
        long remainingSeconds = Duration.between(now, request.getExpiresAt()).getSeconds();

        String customerName = wallet != null ? wallet.getName() : "알 수 없음";
        String customerNickname = wallet != null ? wallet.getNickname() : "알 수 없음";
        String maskedPhone = wallet != null ? maskPhone(wallet.getPhone()) : "010-****-0000";

        return new PendingIssuanceRequestItem(
                request.getId(),
                customerName,
                customerNickname,
                maskedPhone,
                request.getCreatedAt(),
                Math.max(0, elapsedSeconds),
                Math.max(0, remainingSeconds));
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return "010-****-0000";
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() >= 10) {
            return digits.substring(0, 3) + "-****-" + digits.substring(digits.length() - 4);
        }
        return phone;
    }
}
