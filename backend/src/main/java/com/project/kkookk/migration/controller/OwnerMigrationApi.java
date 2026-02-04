package com.project.kkookk.migration.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.migration.controller.dto.MigrationApproveRequest;
import com.project.kkookk.migration.controller.dto.MigrationApproveResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationRejectRequest;
import com.project.kkookk.migration.controller.dto.MigrationRejectResponse;
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

@Tag(name = "Owner Migration", description = "백오피스 마이그레이션 처리 API (Owner 전용)")
@SecurityRequirement(name = "bearerAuth")
public interface OwnerMigrationApi {

    @Operation(summary = "마이그레이션 요청 목록 조회", description = "SUBMITTED 상태의 마이그레이션 요청 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<MigrationListResponse> getList(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "마이그레이션 요청 상세 조회", description = "마이그레이션 요청의 상세 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "마이그레이션 요청 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<MigrationDetailResponse> getDetail(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "마이그레이션 요청 ID", required = true) @PathVariable Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(
            summary = "마이그레이션 승인",
            description =
                    "마이그레이션 요청을 승인하고 스탬프를 적립합니다. "
                            + "approvedStampCount를 입력하지 않으면 고객 요청 개수 또는 기본값 1이 사용됩니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "승인 성공"),
        @ApiResponse(
                responseCode = "400",
                description = "유효성 검증 실패",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "마이그레이션 요청 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "이미 처리된 요청 또는 활성 스탬프 카드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<MigrationApproveResponse> approve(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "마이그레이션 요청 ID", required = true) @PathVariable Long id,
            @Valid @RequestBody MigrationApproveRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "마이그레이션 반려", description = "마이그레이션 요청을 반려합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "반려 성공"),
        @ApiResponse(
                responseCode = "400",
                description = "유효성 검증 실패 (반려 사유 누락)",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "마이그레이션 요청 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "이미 처리된 요청",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<MigrationRejectResponse> reject(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "마이그레이션 요청 ID", required = true) @PathVariable Long id,
            @Valid @RequestBody MigrationRejectRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);
}
