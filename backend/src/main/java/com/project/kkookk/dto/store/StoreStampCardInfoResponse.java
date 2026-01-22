package com.project.kkookk.dto.store;

import io.swagger.v3.oas.annotations.media.Schema;

public record StoreStampCardInfoResponse(
    @Schema(description = "매장 ID", example = "1")
    Long storeId,

    @Schema(description = "매장 이름", example = "카페 쿠쿠")
    String storeName,

    @Schema(description = "스탬프 카드 ID", example = "10")
    Long stampCardId,

    @Schema(description = "스탬프 카드 제목", example = "아메리카노 10잔 적립")
    String title,

    @Schema(description = "목표 스탬프 개수", example = "10")
    int goalStampCount,

    @Schema(description = "보상 이름", example = "아메리카노 1잔")
    String rewardName,

    @Schema(description = "디자인 JSON", example = "{\"color\": \"#FF0000\"}")
    String designJson
) {}
