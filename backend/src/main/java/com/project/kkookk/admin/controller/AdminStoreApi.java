package com.project.kkookk.admin.controller;

import com.project.kkookk.admin.controller.dto.AdminStoreResponse;
import com.project.kkookk.admin.controller.dto.AdminStoreStatusChangeRequest;
import com.project.kkookk.admin.controller.dto.StoreAuditLogResponse;
import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.store.domain.StoreStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Admin Store", description = "관리자 매장 관리 API")
@SecurityRequirement(name = "bearerAuth")
public interface AdminStoreApi {

    @Operation(summary = "전체 매장 목록 조회", description = "관리자가 전체 매장 목록을 조회합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "조회 성공",
                        content =
                                @Content(
                                        array =
                                                @ArraySchema(
                                                        schema =
                                                                @Schema(
                                                                        implementation =
                                                                                AdminStoreResponse
                                                                                        .class)))),
                @ApiResponse(
                        responseCode = "403",
                        description = "관리자 권한 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<List<AdminStoreResponse>> getStores(
            @Parameter(description = "상태 필터") @RequestParam(required = false) StoreStatus status,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "매장 상세 조회", description = "관리자가 특정 매장의 상세 정보를 조회합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "조회 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                AdminStoreResponse.class))),
                @ApiResponse(
                        responseCode = "404",
                        description = "매장을 찾을 수 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<AdminStoreResponse> getStore(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "매장 상태 변경", description = "관리자가 매장 상태를 변경합니다 (승인/정지/해제).")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "상태 변경 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                AdminStoreResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효하지 않은 상태 전이",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "404",
                        description = "매장을 찾을 수 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<AdminStoreResponse> changeStoreStatus(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Valid @RequestBody AdminStoreStatusChangeRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "매장 감사 로그 조회", description = "특정 매장의 감사 로그를 조회합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "조회 성공",
                        content =
                                @Content(
                                        array =
                                                @ArraySchema(
                                                        schema =
                                                                @Schema(
                                                                        implementation =
                                                                                StoreAuditLogResponse
                                                                                        .class)))),
                @ApiResponse(
                        responseCode = "404",
                        description = "매장을 찾을 수 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<List<StoreAuditLogResponse>> getAuditLogs(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);
}
