package com.project.kkookk.wallet.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "스탬프 적립 히스토리 응답")
public record StampEventHistoryResponse(
        @Schema(description = "스탬프 이벤트 목록") List<StampEventSummary> events,
        @Schema(description = "페이지 정보") PageInfo pageInfo) {}
