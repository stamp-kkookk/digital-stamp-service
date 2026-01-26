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
import com.project.kkookk.stampcard.service.exception.StampCardAlreadyActiveException;
import com.project.kkookk.stampcard.service.exception.StampCardDeleteNotAllowedException;
import com.project.kkookk.stampcard.service.exception.StampCardNotFoundException;
import com.project.kkookk.stampcard.service.exception.StampCardStatusInvalidException;
import com.project.kkookk.stampcard.service.exception.StampCardUpdateNotAllowedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StampCardService {

    private static final Logger log = LoggerFactory.getLogger(StampCardService.class);

    private final StampCardRepository stampCardRepository;

    public StampCardService(StampCardRepository stampCardRepository) {
        this.stampCardRepository = stampCardRepository;
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
                        .designJson(request.designJson())
                        .build();

        StampCard saved = stampCardRepository.save(stampCard);
        log.info("Created stamp card with id: {}", saved.getId());

        return StampCardResponse.from(saved);
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
        return StampCardResponse.from(stampCard);
    }

    @Transactional
    public StampCardResponse update(Long storeId, Long id, UpdateStampCardRequest request) {
        StampCard stampCard = findByIdAndStoreId(id, storeId);

        if (stampCard.isActive()) {
            stampCard.updatePartial(request.title(), request.designJson());
            log.info("Partially updated active stamp card: {}", id);
        } else if (stampCard.isDraft() || stampCard.getStatus() == StampCardStatus.PAUSED) {
            stampCard.update(
                    request.title(),
                    request.goalStampCount(),
                    request.requiredStamps(),
                    request.rewardName(),
                    request.rewardQuantity(),
                    request.expireDays(),
                    request.designJson());
            log.info("Fully updated stamp card: {}", id);
        } else {
            throw new StampCardUpdateNotAllowedException();
        }

        return StampCardResponse.from(stampCard);
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
            boolean hasActiveCard =
                    stampCardRepository.existsByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);
            if (hasActiveCard) {
                throw new StampCardAlreadyActiveException();
            }
        }

        stampCard.updateStatus(newStatus);
        log.info("Updated stamp card {} status from {} to {}", id, currentStatus, newStatus);

        return StampCardResponse.from(stampCard);
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
