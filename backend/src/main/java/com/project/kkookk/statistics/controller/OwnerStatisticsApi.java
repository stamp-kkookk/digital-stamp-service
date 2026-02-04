package com.project.kkookk.statistics.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.statistics.dto.StoreStatisticsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Owner Statistics", description = "점주 매장 통계 API")
@SecurityRequirement(name = "bearerAuth")
public interface OwnerStatisticsApi {

    @Operation(
            summary = "매장 통계 조회",
            description =
                    "매장의 적립/리워드 통계를 조회합니다. "
                            + "기간을 지정하지 않으면 최근 30일 데이터를 반환합니다.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "조회 성공",
                content =
                        @Content(schema = @Schema(implementation = StoreStatisticsResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "403",
                description = "해당 매장 접근 권한 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "매장 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<StoreStatisticsResponse> getStoreStatistics(
            @Parameter(description = "매장 ID", example = "1") @PathVariable Long storeId,
            @Parameter(description = "조회 시작일 (기본값: 30일 전)", example = "2026-01-01")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate startDate,
            @Parameter(description = "조회 종료일 (기본값: 오늘)", example = "2026-01-31")
                    @RequestParam(required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate endDate,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);
}
