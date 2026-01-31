package com.project.kkookk.wallet.dto.response;

import com.project.kkookk.store.domain.Store;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "매장 정보")
public record StoreInfo(
        @Schema(description = "매장 ID", example = "123") Long storeId,
        @Schema(description = "매장 이름", example = "꾹꾹 카페 강남점") String storeName) {

    public static StoreInfo from(Store store) {
        return new StoreInfo(store.getId(), store.getName());
    }
}
