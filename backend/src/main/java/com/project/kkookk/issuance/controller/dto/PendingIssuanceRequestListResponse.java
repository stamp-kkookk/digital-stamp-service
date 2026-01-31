package com.project.kkookk.issuance.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "승인 대기 적립 요청 목록 응답")
public record PendingIssuanceRequestListResponse(
        @Schema(description = "대기 요청 목록") List<PendingIssuanceRequestItem> items,
        @Schema(description = "대기 건수", example = "3") int count) {}
