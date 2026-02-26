package com.project.kkookk.admin.controller.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Admin 매장 응답")
public record AdminStoreResponse(
        @Schema(description = "매장 ID") Long id,
        @Schema(description = "매장명") String name,
        @Schema(description = "매장 주소") String address,
        @Schema(description = "매장 전화번호") String phone,
        @Schema(description = "카카오 장소 참조 ID") String placeRef,
        @Schema(description = "매장 아이콘 이미지 URL") String iconImageUrl,
        @Schema(description = "매장 아이콘 썸네일 URL (목록용)") String iconThumbnailUrl,
        @Schema(description = "매장 설명") String description,
        @Schema(description = "매장 상태") StoreStatus status,
        @JsonProperty("hasActiveStampCard") @Schema(description = "활성 스탬프카드 보유 여부")
                boolean hasActiveStampCard,
        @Schema(description = "점주 ID") Long ownerAccountId,
        @Schema(description = "점주 이름") String ownerName,
        @Schema(description = "점주 이메일") String ownerEmail,
        @Schema(description = "점주 전화번호") String ownerPhone,
        @Schema(description = "생성 시각") LocalDateTime createdAt,
        @Schema(description = "수정 시각") LocalDateTime updatedAt) {

    public static AdminStoreResponse of(
            Store store,
            OwnerAccount owner,
            boolean hasActiveStampCard,
            String iconImageUrl,
            String iconThumbnailUrl) {
        return new AdminStoreResponse(
                store.getId(),
                store.getName(),
                store.getAddress(),
                store.getPhone(),
                store.getPlaceRef(),
                iconImageUrl,
                iconThumbnailUrl,
                store.getDescription(),
                store.getStatus(),
                hasActiveStampCard,
                store.getOwnerAccountId(),
                owner != null ? owner.getName() : null,
                owner != null ? owner.getEmail() : null,
                owner != null ? owner.getPhoneNumber() : null,
                store.getCreatedAt(),
                store.getUpdatedAt());
    }
}
