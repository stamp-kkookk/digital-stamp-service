package com.project.kkookk.issuance.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.issuance.controller.dto.CreateIssuanceRequest;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResult;
import com.project.kkookk.issuance.domain.IssuanceRequest;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import com.project.kkookk.issuance.repository.IssuanceRequestRepository;
import com.project.kkookk.issuance.service.exception.IssuanceRequestAlreadyPendingException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestNotFoundException;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerIssuanceService {

    private static final int TTL_SECONDS = 120;

    private final IssuanceRequestRepository issuanceRequestRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StoreRepository storeRepository;

    /**
     * 적립 요청 생성
     *
     * @param walletId 고객 지갑 ID
     * @param request 적립 요청 DTO
     * @return 생성된 적립 요청 결과 (신규 생성 여부 포함)
     */
    @Transactional
    public IssuanceRequestResult createIssuanceRequest(
            Long walletId, CreateIssuanceRequest request) {
        // 1. 매장 존재 확인
        if (!storeRepository.existsById(request.storeId())) {
            throw new BusinessException(ErrorCode.STORE_NOT_FOUND);
        }

        // 2. 지갑 스탬프카드 조회
        WalletStampCard walletStampCard =
                walletStampCardRepository
                        .findById(request.walletStampCardId())
                        .orElseThrow(WalletStampCardNotFoundException::new);

        // 3. 본인 소유 검증
        if (!walletStampCard.getCustomerWalletId().equals(walletId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 4. 멱등성 체크 (지갑별)
        Optional<IssuanceRequest> existing =
                issuanceRequestRepository.findByWalletIdAndIdempotencyKey(
                        walletId, request.idempotencyKey());

        if (existing.isPresent()) {
            IssuanceRequest existingRequest = existing.get();
            // 만료된 요청이 아니면 기존 요청 반환
            if (existingRequest.getStatus() != IssuanceRequestStatus.EXPIRED) {
                return new IssuanceRequestResult(
                        IssuanceRequestResponse.from(
                                existingRequest, walletStampCard.getStampCount()),
                        false);
            }
        }

        // 5. 동일 카드에 PENDING 요청이 있는지 확인
        boolean hasPendingRequest =
                issuanceRequestRepository.existsByWalletStampCardIdAndStatus(
                        request.walletStampCardId(), IssuanceRequestStatus.PENDING);
        if (hasPendingRequest) {
            throw new IssuanceRequestAlreadyPendingException();
        }

        // 6. 새 요청 생성
        IssuanceRequest newRequest =
                IssuanceRequest.builder()
                        .storeId(request.storeId())
                        .walletId(walletId)
                        .walletStampCardId(request.walletStampCardId())
                        .idempotencyKey(request.idempotencyKey())
                        .expiresAt(LocalDateTime.now().plusSeconds(TTL_SECONDS))
                        .build();

        try {
            issuanceRequestRepository.save(newRequest);
        } catch (DataIntegrityViolationException e) {
            // DB Unique Constraint 위반 → 동시 요청으로 인한 중복
            throw new IssuanceRequestAlreadyPendingException();
        }

        return new IssuanceRequestResult(
                IssuanceRequestResponse.from(newRequest, walletStampCard.getStampCount()), true);
    }

    /**
     * 적립 요청 상태 조회 (Polling)
     *
     * @param id 요청 ID
     * @param walletId 고객 지갑 ID
     * @return 적립 요청 응답
     */
    @Transactional
    public IssuanceRequestResponse getIssuanceRequest(Long id, Long walletId) {
        IssuanceRequest request =
                issuanceRequestRepository
                        .findById(id)
                        .orElseThrow(IssuanceRequestNotFoundException::new);

        // 본인 요청 검증
        if (!request.getWalletId().equals(walletId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // Lazy Expiration: 조회 시점에 만료 처리
        if (request.isPending() && request.isExpired()) {
            request.expire();
        }

        WalletStampCard walletStampCard =
                walletStampCardRepository
                        .findById(request.getWalletStampCardId())
                        .orElseThrow(WalletStampCardNotFoundException::new);

        return IssuanceRequestResponse.from(request, walletStampCard.getStampCount());
    }
}
