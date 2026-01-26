package com.project.kkookk.controller.store.dto;

import com.project.kkookk.domain.store.Store;
import com.project.kkookk.domain.store.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/** 매장 응답 DTO. */
@Schema(description = "매장 응답")
public record StoreResponse(
        @Schema(description = "매장 ID", example = "1") Long id,
        @Schema(description = "매장명", example = "스타벅스 강남점") String name,
        @Schema(description = "매장 주소", example = "서울시 강남구 테헤란로 123") String address,
        @Schema(description = "매장 전화번호", example = "02-1234-5678") String phone,
        @Schema(description = "매장 상태", example = "ACTIVE") StoreStatus status,
        @Schema(description = "생성 시각", example = "2025-01-23T10:00:00") LocalDateTime createdAt,
        @Schema(description = "수정 시각", example = "2025-01-23T10:00:00") LocalDateTime updatedAt,
        @Schema(description = "점주 ID", example = "1") Long ownerAccountId) {

    /**
     * Store 엔티티로부터 StoreResponse 생성.
     *
     * @param store Store 엔티티
     * @return StoreResponse
     */
    public static StoreResponse from(final Store store) {
        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getAddress(),
                store.getPhone(),
                store.getStatus(),
                store.getCreatedAt(),
                store.getUpdatedAt(),
                store.getOwnerAccountId());
    }
}
