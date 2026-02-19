package com.project.kkookk.stampcard.service;

import com.project.kkookk.stampcard.controller.dto.CreateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.StampCardListResponse;
import com.project.kkookk.stampcard.controller.dto.StampCardResponse;
import com.project.kkookk.stampcard.controller.dto.StampCardSummary;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.stampcard.service.exception.StampCardDeleteNotAllowedException;
import com.project.kkookk.stampcard.service.exception.StampCardNotFoundException;
import com.project.kkookk.stampcard.service.exception.StampCardStatusInvalidException;
import com.project.kkookk.stampcard.service.exception.StampCardUpdateNotAllowedException;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class StampCardService {

    private final StampCardRepository stampCardRepository;
    private final WalletStampCardRepository walletStampCardRepository;

    public StampCardService(
            StampCardRepository stampCardRepository,
            WalletStampCardRepository walletStampCardRepository) {
        this.stampCardRepository = stampCardRepository;
        this.walletStampCardRepository = walletStampCardRepository;
    }

    @Transactional
    public StampCardResponse create(Long storeId, CreateStampCardRequest request) {
        log.info("Creating stamp card for store: {}", storeId);

        StampCard stampCard =
                StampCard.builder()
                        .storeId(storeId)
                        .title(request.title())
                        .goalStampCount(request.goalStampCount())
                        .requiredStamps(request.requiredStamps())
                        .rewardName(request.rewardName())
                        .rewardQuantity(request.rewardQuantity())
                        .expireDays(request.expireDays())
                        .designType(request.designType())
                        .designJson(request.designJson())
                        .build();

        StampCard saved = stampCardRepository.save(stampCard);
        log.info("Created stamp card with id: {}", saved.getId());

        return StampCardResponse.from(saved, false);
    }

    public StampCardListResponse getList(Long storeId, StampCardStatus status, Pageable pageable) {
        Page<StampCard> page;
        if (status != null) {
            page = stampCardRepository.findByStoreIdAndStatus(storeId, status, pageable);
        } else {
            page = stampCardRepository.findByStoreId(storeId, pageable);
        }

        Page<StampCardSummary> summaryPage = page.map(StampCardSummary::from);
        return StampCardListResponse.from(summaryPage);
    }

    public StampCardResponse getById(Long storeId, Long id) {
        StampCard stampCard = findByIdAndStoreId(id, storeId);
        boolean issued = walletStampCardRepository.existsByStampCardId(stampCard.getId());
        return StampCardResponse.from(stampCard, issued);
    }

    @Transactional
    public StampCardResponse update(Long storeId, Long id, UpdateStampCardRequest request) {
        StampCard stampCard = findByIdAndStoreId(id, storeId);

        boolean issued = walletStampCardRepository.existsByStampCardId(stampCard.getId());
        if (issued) {
            throw new StampCardUpdateNotAllowedException();
        }

        stampCard.update(
                request.title(),
                request.goalStampCount(),
                request.requiredStamps(),
                request.rewardName(),
                request.rewardQuantity(),
                request.expireDays(),
                request.designType(),
                request.designJson());
        log.info("Fully updated stamp card: {}", id);

        return StampCardResponse.from(stampCard, false);
    }

    @Transactional
    public StampCardResponse updateStatus(
            Long storeId, Long id, UpdateStampCardStatusRequest request) {
        StampCard stampCard = findByIdAndStoreId(id, storeId);
        StampCardStatus currentStatus = stampCard.getStatus();
        StampCardStatus newStatus = request.status();

        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new StampCardStatusInvalidException(currentStatus, newStatus);
        }

        if (newStatus == StampCardStatus.ACTIVE) {
            stampCardRepository
                    .findByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE)
                    .ifPresent(
                            activeCard -> {
                                activeCard.updateStatus(StampCardStatus.ARCHIVED);
                                log.info(
                                        "[StampCard] Auto-archived existing active card id={}",
                                        activeCard.getId());
                            });
        }

        stampCard.updateStatus(newStatus);
        log.info("[StampCard] Status transition id={} from={} to={}", id, currentStatus, newStatus);

        boolean issued = walletStampCardRepository.existsByStampCardId(stampCard.getId());
        return StampCardResponse.from(stampCard, issued);
    }

    @Transactional
    public void delete(Long storeId, Long id) {
        StampCard stampCard = findByIdAndStoreId(id, storeId);

        if (!stampCard.isDraft()) {
            throw new StampCardDeleteNotAllowedException();
        }

        stampCardRepository.delete(stampCard);
        log.info("Deleted stamp card: {}", id);
    }

    private StampCard findByIdAndStoreId(Long id, Long storeId) {
        return stampCardRepository
                .findByIdAndStoreId(id, storeId)
                .orElseThrow(StampCardNotFoundException::new);
    }
}
