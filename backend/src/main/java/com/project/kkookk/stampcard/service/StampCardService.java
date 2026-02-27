package com.project.kkookk.stampcard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.image.ImageProcessingService;
import com.project.kkookk.stampcard.controller.dto.CreateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.StampCardListResponse;
import com.project.kkookk.stampcard.controller.dto.StampCardResponse;
import com.project.kkookk.stampcard.controller.dto.StampCardSummary;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardDesignType;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.stampcard.service.exception.StampCardDeleteNotAllowedException;
import com.project.kkookk.stampcard.service.exception.StampCardNotFoundException;
import com.project.kkookk.stampcard.service.exception.StampCardStatusInvalidException;
import com.project.kkookk.stampcard.service.exception.StampCardUpdateNotAllowedException;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Transactional(readOnly = true)
public class StampCardService {

    private static final long MAX_BACKGROUND_SIZE = 3 * 1024 * 1024;
    private static final long MAX_STAMP_IMAGE_SIZE = 500 * 1024;

    private final StampCardRepository stampCardRepository;
    private final WalletStampCardRepository walletStampCardRepository;
    private final StoreRepository storeRepository;
    private final ObjectMapper objectMapper;
    private final ImageProcessingService imageProcessingService;

    public StampCardService(
            StampCardRepository stampCardRepository,
            WalletStampCardRepository walletStampCardRepository,
            StoreRepository storeRepository,
            ObjectMapper objectMapper,
            ImageProcessingService imageProcessingService) {
        this.stampCardRepository = stampCardRepository;
        this.walletStampCardRepository = walletStampCardRepository;
        this.storeRepository = storeRepository;
        this.objectMapper = objectMapper;
        this.imageProcessingService = imageProcessingService;
    }

    @Transactional
    public StampCardResponse create(
            Long ownerId,
            Long storeId,
            CreateStampCardRequest request,
            MultipartFile backgroundImage,
            MultipartFile stampImage) {
        validateStoreOwnership(storeId, ownerId);

        log.info("Creating stamp card for store: {}", storeId);
        validateCustomDesignJson(request.designType(), request.designJson());

        String bgKey = uploadImage(backgroundImage, "stampcards/bg", MAX_BACKGROUND_SIZE);
        String stampKey = uploadImage(stampImage, "stampcards/stamp", MAX_STAMP_IMAGE_SIZE);

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
                        .backgroundImageKey(bgKey)
                        .stampImageKey(stampKey)
                        .build();

        StampCard saved = stampCardRepository.save(stampCard);
        log.info("Created stamp card with id: {}", saved.getId());

        return toResponse(saved, false);
    }

    public StampCardListResponse getList(
            Long ownerId, Long storeId, StampCardStatus status, Pageable pageable) {
        validateStoreOwnership(storeId, ownerId);

        Page<StampCard> page;
        if (status != null) {
            page = stampCardRepository.findByStoreIdAndStatus(storeId, status, pageable);
        } else {
            page = stampCardRepository.findByStoreId(storeId, pageable);
        }

        Page<StampCardSummary> summaryPage = page.map(StampCardSummary::from);
        return StampCardListResponse.from(summaryPage);
    }

    public StampCardResponse getById(Long ownerId, Long storeId, Long id) {
        validateStoreOwnership(storeId, ownerId);

        StampCard stampCard = findByIdAndStoreId(id, storeId);
        boolean issued = walletStampCardRepository.existsByStampCardId(stampCard.getId());
        return toResponse(stampCard, issued);
    }

    @Transactional
    public StampCardResponse update(
            Long ownerId,
            Long storeId,
            Long id,
            UpdateStampCardRequest request,
            MultipartFile backgroundImage,
            MultipartFile stampImage) {
        validateStoreOwnership(storeId, ownerId);

        StampCard stampCard = findByIdAndStoreId(id, storeId);

        boolean issued = walletStampCardRepository.existsByStampCardId(stampCard.getId());
        if (issued) {
            throw new StampCardUpdateNotAllowedException();
        }

        validateCustomDesignJson(request.designType(), request.designJson());

        String newBgKey = uploadImage(backgroundImage, "stampcards/bg", MAX_BACKGROUND_SIZE);
        String newStampKey = uploadImage(stampImage, "stampcards/stamp", MAX_STAMP_IMAGE_SIZE);

        String bgKeyToSet = newBgKey != null ? newBgKey : stampCard.getBackgroundImageKey();
        String stampKeyToSet = newStampKey != null ? newStampKey : stampCard.getStampImageKey();

        if (newBgKey != null) {
            deleteImageSilently(stampCard.getBackgroundImageKey());
        }
        if (newStampKey != null) {
            deleteImageSilently(stampCard.getStampImageKey());
        }

        stampCard.update(
                request.title(),
                request.goalStampCount(),
                request.requiredStamps(),
                request.rewardName(),
                request.rewardQuantity(),
                request.expireDays(),
                request.designType(),
                request.designJson(),
                bgKeyToSet,
                stampKeyToSet);
        log.info("Fully updated stamp card: {}", id);

        return toResponse(stampCard, false);
    }

    @Transactional
    public StampCardResponse updateStatus(
            Long ownerId, Long storeId, Long id, UpdateStampCardStatusRequest request) {
        StampCardStatus newStatus = request.status();

        // ACTIVE 전이 시: Store 비관적 락으로 동일 매장 요청 직렬화 + 소유권 검증
        if (newStatus == StampCardStatus.ACTIVE) {
            storeRepository
                    .findByIdAndOwnerAccountIdWithLock(storeId, ownerId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.STORE_ACCESS_DENIED));
        } else {
            validateStoreOwnership(storeId, ownerId);
        }

        StampCard stampCard = findByIdAndStoreId(id, storeId);
        StampCardStatus currentStatus = stampCard.getStatus();

        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new StampCardStatusInvalidException(currentStatus, newStatus);
        }

        if (newStatus == StampCardStatus.ACTIVE) {
            stampCardRepository
                    .findByStoreIdAndStatusWithLock(storeId, StampCardStatus.ACTIVE)
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
        return toResponse(stampCard, issued);
    }

    @Transactional
    public void delete(Long ownerId, Long storeId, Long id) {
        validateStoreOwnership(storeId, ownerId);

        StampCard stampCard = findByIdAndStoreId(id, storeId);

        boolean issued = walletStampCardRepository.existsByStampCardId(stampCard.getId());
        if (issued) {
            throw new StampCardDeleteNotAllowedException();
        }

        deleteImageSilently(stampCard.getBackgroundImageKey());
        deleteImageSilently(stampCard.getStampImageKey());
        stampCardRepository.delete(stampCard);
        log.info("Deleted stamp card: {}", id);
    }

    private void validateStoreOwnership(Long storeId, Long ownerId) {
        storeRepository
                .findByIdAndOwnerAccountId(storeId, ownerId)
                .orElseThrow(() -> new BusinessException(ErrorCode.STORE_ACCESS_DENIED));
    }

    private void validateCustomDesignJson(StampCardDesignType designType, String designJson) {
        if (designType != StampCardDesignType.CUSTOM) {
            return;
        }
        if (designJson == null || designJson.isBlank()) {
            throw new IllegalArgumentException("CUSTOM designType requires designJson");
        }
        try {
            JsonNode root = objectMapper.readTree(designJson);
            if (!root.has("version") || root.get("version").asInt() != 2) {
                throw new IllegalArgumentException("CUSTOM designJson must have version: 2");
            }
            JsonNode back = root.get("back");
            if (back == null || !back.has("stampSlots") || !back.get("stampSlots").isArray()) {
                throw new IllegalArgumentException(
                        "CUSTOM designJson must have back.stampSlots array");
            }
            if (back.get("stampSlots").isEmpty()) {
                throw new IllegalArgumentException("back.stampSlots must not be empty");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid CUSTOM designJson: " + e.getMessage());
        }
    }

    private StampCardResponse toResponse(StampCard card, boolean issued) {
        String designJson = resolveDesignJson(card);
        return StampCardResponse.from(card, issued, designJson);
    }

    /**
     * IMAGE 타입: imageKey → URL로 변환하여 designJson 구성. 레거시(base64)도 그대로 반환. COLOR/CUSTOM 타입: 기존
     * designJson 그대로 반환.
     */
    String resolveDesignJson(StampCard card) {
        if (card.getDesignType() != StampCardDesignType.IMAGE) {
            return card.getDesignJson();
        }
        if (card.getBackgroundImageKey() != null || card.getStampImageKey() != null) {
            Map<String, String> map = new LinkedHashMap<>();
            if (card.getBackgroundImageKey() != null) {
                map.put(
                        "backgroundImage",
                        imageProcessingService.getUrl(card.getBackgroundImageKey()));
            }
            if (card.getStampImageKey() != null) {
                map.put("stampImage", imageProcessingService.getUrl(card.getStampImageKey()));
            }
            try {
                return objectMapper.writeValueAsString(map);
            } catch (Exception e) {
                log.warn("Failed to build IMAGE designJson for card {}", card.getId(), e);
                return card.getDesignJson();
            }
        }
        return card.getDesignJson();
    }

    private String uploadImage(MultipartFile file, String keyPrefix, long maxSize) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (file.getSize() > maxSize) {
            throw new BusinessException(ErrorCode.STAMP_CARD_IMAGE_TOO_LARGE);
        }
        try {
            return imageProcessingService.processAndStore(keyPrefix, file.getInputStream());
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_STORAGE_ERROR);
        }
    }

    private void deleteImageSilently(String imageKey) {
        if (imageKey == null) {
            return;
        }
        try {
            imageProcessingService.deleteWithThumbnail(imageKey);
        } catch (Exception e) {
            log.warn("Failed to delete image: {}", imageKey, e);
        }
    }

    private StampCard findByIdAndStoreId(Long id, Long storeId) {
        return stampCardRepository
                .findByIdAndStoreId(id, storeId)
                .orElseThrow(StampCardNotFoundException::new);
    }
}
