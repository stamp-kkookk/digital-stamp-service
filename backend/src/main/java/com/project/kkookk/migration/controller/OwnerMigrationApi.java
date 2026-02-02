package com.project.kkookk.migration.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

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
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId);

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
            @Parameter(description = "마이그레이션 요청 ID", required = true) @PathVariable Long id);
}
