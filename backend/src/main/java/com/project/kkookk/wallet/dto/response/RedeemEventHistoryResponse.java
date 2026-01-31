package com.project.kkookk.wallet.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "리워드 사용 히스토리 응답")
public record RedeemEventHistoryResponse(
        @Schema(description = "리워드 사용 이벤트 목록") List<RedeemEventSummary> events,
        @Schema(description = "페이지 정보") PageInfo pageInfo) {}
