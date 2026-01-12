package com.kkookk.issuance.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.customer.entity.SessionScope;
import com.kkookk.customer.entity.WalletStampCard;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.customer.repository.WalletStampCardRepository;
import com.kkookk.issuance.dto.CreateIssuanceRequest;
import com.kkookk.issuance.dto.IssuanceRequestResponse;
import com.kkookk.issuance.entity.IssuanceRequest;
import com.kkookk.issuance.entity.IssuanceRequestStatus;
import com.kkookk.issuance.entity.StampEvent;
import com.kkookk.issuance.entity.StampEventType;
import com.kkookk.issuance.repository.IssuanceRequestRepository;
import com.kkookk.issuance.repository.StampEventRepository;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.stampcard.entity.StampCardStatus;
import com.kkookk.stampcard.repository.StampCardRepository;
import com.kkookk.store.entity.Store;
import com.kkookk.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IssuanceService {

    private static final int REQUEST_TTL_SECONDS = 90; // 90초

    private final IssuanceRequestRepository issuanceRequestRepository;
    private final StampEventRepository stampEventRepository;
    private final CustomerSessionRepository sessionRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;

    @Transactional
    public IssuanceRequestResponse createIssuanceRequest(
            String sessionToken,
            CreateIssuanceRequest request) {

        // 세션 검증
        CustomerSession session = sessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new BusinessException(
                        "S001",
                        "유효하지 않은 세션입니다.",
                        HttpStatus.UNAUTHORIZED
                ));

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "S002",
                    "세션이 만료되었습니다. 다시 로그인해주세요.",
                    HttpStatus.UNAUTHORIZED
            );
        }

        CustomerWallet wallet = session.getWallet();

        // 매장 조회
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new BusinessException(
                        "ST001",
                        "매장을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        // 활성 스탬프 카드 조회
        StampCard stampCard = stampCardRepository.findByStoreIdAndStatus(
                        request.getStoreId(), StampCardStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(
                        "SC002",
                        "활성화된 스탬프 카드가 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        // 중복 요청 확인 (clientRequestId)
        if (issuanceRequestRepository.findByClientRequestId(request.getClientRequestId()).isPresent()) {
            throw new BusinessException(
                    "IR001",
                    "이미 처리된 요청입니다.",
                    HttpStatus.CONFLICT
            );
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(REQUEST_TTL_SECONDS);

        IssuanceRequest issuanceRequest = IssuanceRequest.builder()
                .wallet(wallet)
                .store(store)
                .stampCard(stampCard)
                .clientRequestId(request.getClientRequestId())
                .status(IssuanceRequestStatus.PENDING)
                .expiresAt(expiresAt)
                .build();

        issuanceRequest = issuanceRequestRepository.save(issuanceRequest);

        log.info("Issuance request created: id={}, wallet={}, store={}",
                issuanceRequest.getId(), wallet.getId(), store.getId());

        return toResponse(issuanceRequest);
    }

    @Transactional(readOnly = true)
    public IssuanceRequestResponse getIssuanceRequest(Long id) {
        IssuanceRequest request = issuanceRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "IR002",
                        "적립 요청을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        // 만료 확인 및 상태 업데이트는 별도 스케줄러에서 처리
        // 여기서는 현재 상태만 반환
        return toResponse(request);
    }

    @Transactional(readOnly = true)
    public List<IssuanceRequestResponse> getPendingRequests(Long storeId) {
        List<IssuanceRequest> requests = issuanceRequestRepository
                .findByStoreIdAndStatusAndExpiresAtAfterOrderByCreatedAtAsc(
                        storeId, IssuanceRequestStatus.PENDING, LocalDateTime.now());

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IssuanceRequestResponse approveRequest(Long requestId) {
        IssuanceRequest request = issuanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(
                        "IR002",
                        "적립 요청을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        if (request.getStatus() != IssuanceRequestStatus.PENDING) {
            throw new BusinessException(
                    "IR003",
                    "이미 처리된 요청입니다.",
                    HttpStatus.CONFLICT
            );
        }

        if (request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(
                    "IR004",
                    "만료된 요청입니다.",
                    HttpStatus.GONE
            );
        }

        // WalletStampCard 조회 또는 생성
        WalletStampCard walletStampCard = walletStampCardRepository
                .findByWalletIdAndStampCardId(request.getWallet().getId(), request.getStampCard().getId())
                .orElseGet(() -> {
                    WalletStampCard newCard = WalletStampCard.builder()
                            .wallet(request.getWallet())
                            .stampCard(request.getStampCard())
                            .stampCount(0)
                            .build();
                    return walletStampCardRepository.save(newCard);
                });

        // 스탬프 적립
        walletStampCard.setStampCount(walletStampCard.getStampCount() + 1);
        walletStampCardRepository.save(walletStampCard);

        // 이벤트 로그
        StampEvent event = StampEvent.builder()
                .wallet(request.getWallet())
                .store(request.getStore())
                .stampCard(request.getStampCard())
                .walletStampCard(walletStampCard)
                .eventType(StampEventType.ISSUED)
                .stampDelta(1)
                .requestId(request.getClientRequestId())
                .build();
        stampEventRepository.save(event);

        // 요청 상태 업데이트
        request.setStatus(IssuanceRequestStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        issuanceRequestRepository.save(request);

        log.info("Issuance request approved: id={}, walletStampCard={}, newCount={}",
                requestId, walletStampCard.getId(), walletStampCard.getStampCount());

        return toResponse(request);
    }

    @Transactional
    public IssuanceRequestResponse rejectRequest(Long requestId, String reason) {
        IssuanceRequest request = issuanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(
                        "IR002",
                        "적립 요청을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        if (request.getStatus() != IssuanceRequestStatus.PENDING) {
            throw new BusinessException(
                    "IR003",
                    "이미 처리된 요청입니다.",
                    HttpStatus.CONFLICT
            );
        }

        request.setStatus(IssuanceRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request.setProcessedAt(LocalDateTime.now());
        issuanceRequestRepository.save(request);

        log.info("Issuance request rejected: id={}, reason={}", requestId, reason);

        return toResponse(request);
    }

    private IssuanceRequestResponse toResponse(IssuanceRequest request) {
        return IssuanceRequestResponse.builder()
                .id(request.getId())
                .walletId(request.getWallet().getId())
                .storeId(request.getStore().getId())
                .storeName(request.getStore().getName())
                .stampCardId(request.getStampCard().getId())
                .stampCardTitle(request.getStampCard().getTitle())
                .clientRequestId(request.getClientRequestId())
                .status(request.getStatus().name())
                .expiresAt(request.getExpiresAt())
                .rejectionReason(request.getRejectionReason())
                .processedAt(request.getProcessedAt())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
