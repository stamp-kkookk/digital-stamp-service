package com.project.kkookk.store.controller.owner.dto;

import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "매장 응답")
public record StoreResponse(
        @Schema(description = "매장 ID", example = "1") Long id,
        @Schema(description = "매장명", example = "스타벅스 강남점") String name,
        @Schema(description = "매장 주소", example = "서울시 강남구 테헤란로 123") String address,
        @Schema(description = "매장 전화번호", example = "02-1234-5678") String phone,
        @Schema(description = "카카오 장소 참조 ID", example = "12345678") String placeRef,
        @Schema(description = "매장 아이콘 이미지 URL", example = "/storage/stores/1/icon.webp")
                String iconImageUrl,
        @Schema(description = "매장 설명", example = "강남역 3번 출구 근처 아늑한 카페") String description,
        @Schema(description = "매장 상태", example = "DRAFT") StoreStatus status,
        @Schema(description = "생성 시각", example = "2025-01-23T10:00:00") LocalDateTime createdAt,
        @Schema(description = "수정 시각", example = "2025-01-23T10:00:00") LocalDateTime updatedAt,
        @Schema(description = "점주 ID", example = "1") Long ownerAccountId) {

    public static StoreResponse from(final Store store, final String iconImageUrl) {
        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getAddress(),
                store.getPhone(),
                store.getPlaceRef(),
                iconImageUrl,
                store.getDescription(),
                store.getStatus(),
                store.getCreatedAt(),
                store.getUpdatedAt(),
                store.getOwnerAccountId());
    }
}
