package com.project.kkookk.store.dto.response;

import com.project.kkookk.store.domain.Store;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "매장 목록 아이템 응답")
public record StoreListItemResponse(
        @Schema(description = "매장 ID", example = "1") Long storeId,
        @Schema(description = "매장 이름", example = "꾹꾹 카페 강남점") String storeName,
        @Schema(description = "매장 주소", example = "서울시 강남구 테헤란로 123") String address) {

    public static StoreListItemResponse from(Store store) {
        return new StoreListItemResponse(store.getId(), store.getName(), store.getAddress());
    }
}
