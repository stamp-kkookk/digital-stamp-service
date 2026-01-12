package com.kkookk.migration.service;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.entity.WalletStampCard;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.customer.repository.WalletStampCardRepository;
import com.kkookk.issuance.entity.StampEvent;
import com.kkookk.issuance.entity.StampEventType;
import com.kkookk.issuance.repository.StampEventRepository;
import com.kkookk.migration.dto.CreateMigrationRequest;
import com.kkookk.migration.dto.MigrationRequestResponse;
import com.kkookk.migration.entity.MigrationStatus;
import com.kkookk.migration.entity.StampMigrationRequest;
import com.kkookk.migration.repository.StampMigrationRequestRepository;
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
public class MigrationService {

    private final StampMigrationRequestRepository migrationRequestRepository;
    private final CustomerSessionRepository sessionRepository;
    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StampEventRepository stampEventRepository;

    @Transactional
    public MigrationRequestResponse createMigrationRequest(
            String sessionToken,
            CreateMigrationRequest request) {

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

        // 중복 요청 확인 (wallet당 store별 1회)
        if (migrationRequestRepository.findByWalletIdAndStoreId(
                session.getWallet().getId(), request.getStoreId()).isPresent()) {
            throw new BusinessException(
                    "M001",
                    "이미 이전 요청을 제출하셨습니다.",
                    HttpStatus.CONFLICT
            );
        }

        // 마이그레이션 요청 생성
        StampMigrationRequest migrationRequest = StampMigrationRequest.builder()
                .wallet(session.getWallet())
                .store(store)
                .stampCard(stampCard)
                .photoPath(request.getPhotoFileName())
                .status(MigrationStatus.SUBMITTED)
                .build();

        migrationRequest = migrationRequestRepository.save(migrationRequest);

        log.info("Migration request created: id={}, wallet={}, store={}",
                migrationRequest.getId(), session.getWallet().getId(), store.getId());

        return toResponse(migrationRequest);
    }

    @Transactional(readOnly = true)
    public List<MigrationRequestResponse> getMyMigrationRequests(String sessionToken) {
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

        List<StampMigrationRequest> requests = migrationRequestRepository
                .findByWalletIdOrderByCreatedAtDesc(session.getWallet().getId());

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MigrationRequestResponse> getSubmittedRequests(Long storeId) {
        List<StampMigrationRequest> requests = migrationRequestRepository
                .findByStoreIdAndStatusOrderByCreatedAtAsc(storeId, MigrationStatus.SUBMITTED);

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MigrationRequestResponse> getAllStoreMigrationRequests(Long storeId) {
        List<StampMigrationRequest> requests = migrationRequestRepository
                .findByStoreIdOrderByCreatedAtDesc(storeId);

        return requests.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MigrationRequestResponse approveMigrationRequest(Long requestId, Integer approvedCount) {
        StampMigrationRequest request = migrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(
                        "M002",
                        "마이그레이션 요청을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        if (request.getStatus() != MigrationStatus.SUBMITTED) {
            throw new BusinessException(
                    "M003",
                    "이미 처리된 요청입니다.",
                    HttpStatus.CONFLICT
            );
        }

        if (approvedCount < 0 || approvedCount > request.getStampCard().getStampGoal()) {
            throw new BusinessException(
                    "M004",
                    "승인 개수가 올바르지 않습니다.",
                    HttpStatus.BAD_REQUEST
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

        // 스탬프 추가
        walletStampCard.setStampCount(walletStampCard.getStampCount() + approvedCount);
        walletStampCardRepository.save(walletStampCard);

        // 이벤트 로그
        StampEvent event = StampEvent.builder()
                .wallet(request.getWallet())
                .store(request.getStore())
                .stampCard(request.getStampCard())
                .walletStampCard(walletStampCard)
                .eventType(StampEventType.MIGRATED)
                .stampDelta(approvedCount)
                .requestId("migration-" + request.getId())
                .notes("Paper stamp migration approved")
                .build();
        stampEventRepository.save(event);

        // 요청 상태 업데이트
        request.setStatus(MigrationStatus.APPROVED);
        request.setApprovedStampCount(approvedCount);
        request.setProcessedAt(LocalDateTime.now());
        migrationRequestRepository.save(request);

        log.info("Migration request approved: id={}, approvedCount={}, newTotal={}",
                requestId, approvedCount, walletStampCard.getStampCount());

        return toResponse(request);
    }

    @Transactional
    public MigrationRequestResponse rejectMigrationRequest(Long requestId, String reason) {
        StampMigrationRequest request = migrationRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(
                        "M002",
                        "마이그레이션 요청을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        if (request.getStatus() != MigrationStatus.SUBMITTED) {
            throw new BusinessException(
                    "M003",
                    "이미 처리된 요청입니다.",
                    HttpStatus.CONFLICT
            );
        }

        request.setStatus(MigrationStatus.REJECTED);
        request.setRejectReason(reason);
        request.setProcessedAt(LocalDateTime.now());
        migrationRequestRepository.save(request);

        log.info("Migration request rejected: id={}, reason={}", requestId, reason);

        return toResponse(request);
    }

    private MigrationRequestResponse toResponse(StampMigrationRequest request) {
        return MigrationRequestResponse.builder()
                .id(request.getId())
                .walletId(request.getWallet().getId())
                .storeId(request.getStore().getId())
                .storeName(request.getStore().getName())
                .stampCardId(request.getStampCard().getId())
                .stampCardTitle(request.getStampCard().getTitle())
                .photoUrl("/api/files/" + request.getPhotoPath())
                .status(request.getStatus().name())
                .approvedStampCount(request.getApprovedStampCount())
                .rejectReason(request.getRejectReason())
                .processedAt(request.getProcessedAt())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
