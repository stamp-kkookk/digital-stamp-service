package com.project.kkookk.issuance.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.issuance.controller.dto.CreateIssuanceRequest;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Customer Issuance", description = "고객 적립 요청 API")
@SecurityRequirement(name = "bearerAuth")
public interface CustomerIssuanceApi {

    @Operation(summary = "적립 요청 생성", description = "스탬프 적립 요청을 생성합니다. TTL 120초, 멱등성 키로 중복 방지")
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "요청 생성 성공",
                content =
                        @Content(schema = @Schema(implementation = IssuanceRequestResponse.class))),
        @ApiResponse(
                responseCode = "200",
                description = "기존 요청 반환 (멱등성)",
                content =
                        @Content(schema = @Schema(implementation = IssuanceRequestResponse.class))),
        @ApiResponse(
                responseCode = "400",
                description = "유효성 검증 실패",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "403",
                description = "본인 지갑이 아님",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "매장/스탬프카드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "이미 대기 중인 요청 존재",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<IssuanceRequestResponse> createIssuanceRequest(
            @Valid @RequestBody CreateIssuanceRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomerPrincipal principal);

    @Operation(
            summary = "적립 요청 상태 조회",
            description = "Polling용 상태 조회. 2~3초 간격 권장. 만료 시 자동으로 EXPIRED 처리")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "조회 성공",
                content =
                        @Content(schema = @Schema(implementation = IssuanceRequestResponse.class))),
        @ApiResponse(
                responseCode = "403",
                description = "본인 요청이 아님",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "요청 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<IssuanceRequestResponse> getIssuanceRequest(
            @Parameter(description = "요청 ID", example = "1") @PathVariable Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomerPrincipal principal);
}
