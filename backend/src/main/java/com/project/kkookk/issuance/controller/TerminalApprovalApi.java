package com.project.kkookk.issuance.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.issuance.controller.dto.IssuanceApprovalResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRejectionResponse;
import com.project.kkookk.issuance.controller.dto.PendingIssuanceRequestListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Terminal Approval", description = "매장 단말 적립 승인/거절 API")
@SecurityRequirement(name = "bearerAuth")
public interface TerminalApprovalApi {

    @Operation(
            summary = "승인 대기 목록 조회",
            description = "매장의 PENDING 상태 적립 요청 목록 조회. 2~3초 주기 Polling 권장")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "조회 성공",
                content =
                        @Content(
                                schema =
                                        @Schema(
                                                implementation =
                                                        PendingIssuanceRequestListResponse.class))),
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
    ResponseEntity<PendingIssuanceRequestListResponse> getPendingRequests(
            @Parameter(description = "매장 ID", example = "1") @PathVariable Long storeId,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "적립 요청 승인", description = "PENDING 상태의 적립 요청을 승인. 스탬프 1개 적립 + 원장 기록")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "승인 성공",
                content =
                        @Content(schema = @Schema(implementation = IssuanceApprovalResponse.class))),
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
                description = "요청 또는 매장 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "이미 처리된 요청",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "410",
                description = "요청 만료됨",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<IssuanceApprovalResponse> approveRequest(
            @Parameter(description = "매장 ID", example = "1") @PathVariable Long storeId,
            @Parameter(description = "요청 ID", example = "1") @PathVariable Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "적립 요청 거절", description = "PENDING 상태의 적립 요청을 거절")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "거절 성공",
                content =
                        @Content(
                                schema = @Schema(implementation = IssuanceRejectionResponse.class))),
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
                description = "요청 또는 매장 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "이미 처리된 요청",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "410",
                description = "요청 만료됨",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<IssuanceRejectionResponse> rejectRequest(
            @Parameter(description = "매장 ID", example = "1") @PathVariable Long storeId,
            @Parameter(description = "요청 ID", example = "1") @PathVariable Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);
}
