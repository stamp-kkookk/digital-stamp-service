package com.project.kkookk.store.dto.response;

import com.project.kkookk.store.domain.Store;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "매장 공개 정보 응답")
public record StorePublicInfoResponse(
        @Schema(description = "매장 ID", example = "1") Long storeId,
        @Schema(description = "매장 이름", example = "꾹꾹 카페 강남점") String storeName,
        @Schema(description = "발급된 활성 스탬프카드 개수", example = "3") Integer activeStampCardCount) {
    public static StorePublicInfoResponse of(Store store, Integer activeStampCardCount) {
        return new StorePublicInfoResponse(store.getId(), store.getName(), activeStampCardCount);
    }
}
