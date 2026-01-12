package com.kkookk.common.controller;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.stampcard.dto.PublicStampCardResponse;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.stampcard.entity.StampCardStatus;
import com.kkookk.stampcard.repository.StampCardRepository;
import com.kkookk.store.dto.PublicStoreResponse;
import com.kkookk.store.entity.Store;
import com.kkookk.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final StoreRepository storeRepository;
    private final StampCardRepository stampCardRepository;

    @GetMapping("/stores/{storeId}")
    public ResponseEntity<PublicStoreResponse> getStore(@PathVariable Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(
                        "S001",
                        "매장을 찾을 수 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        return ResponseEntity.ok(PublicStoreResponse.from(store));
    }

    @GetMapping("/stores/{storeId}/active-stampcard")
    public ResponseEntity<PublicStampCardResponse> getActiveStampCard(@PathVariable Long storeId) {
        // Verify store exists
        if (!storeRepository.existsById(storeId)) {
            throw new BusinessException(
                    "S001",
                    "매장을 찾을 수 없습니다.",
                    HttpStatus.NOT_FOUND
            );
        }

        StampCard stampCard = stampCardRepository.findByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(
                        "SC003",
                        "활성화된 스탬프 카드가 없습니다.",
                        HttpStatus.NOT_FOUND
                ));

        return ResponseEntity.ok(PublicStampCardResponse.from(stampCard));
    }
}
