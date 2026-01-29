package com.project.kkookk.wallet.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "스탬프 카드 정렬 기준")
public enum StampCardSortType {
    @Schema(description = "최근 적립순 (기본값)")
    LAST_STAMPED,

    @Schema(description = "생성순")
    CREATED,

    @Schema(description = "진행률순")
    PROGRESS
}
