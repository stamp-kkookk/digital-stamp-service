package com.project.kkookk.controller.store;

import com.project.kkookk.controller.store.dto.StoreCreateRequest;
import com.project.kkookk.controller.store.dto.StoreResponse;
import com.project.kkookk.controller.store.dto.StoreUpdateRequest;
import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.OwnerPrincipal;
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

/** 매장 관리 API. */
@Tag(name = "Store", description = "매장 관리 API")
@SecurityRequirement(name = "bearerAuth")
public interface StoreApi {

    @Operation(summary = "매장 생성", description = "새로운 매장을 생성합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "201",
                        description = "매장 생성 성공",
                        content = @Content(schema = @Schema(implementation = StoreResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "401",
                        description = "인증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<StoreResponse> createStore(
            @Valid @RequestBody StoreCreateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "매장 목록 조회", description = "내가 소유한 모든 매장 목록을 조회합니다.")
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
                                                                                StoreResponse
                                                                                        .class)))),
                @ApiResponse(
                        responseCode = "401",
                        description = "인증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<List<StoreResponse>> getStores(
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "매장 단건 조회", description = "특정 매장의 상세 정보를 조회합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "조회 성공",
                        content = @Content(schema = @Schema(implementation = StoreResponse.class))),
                @ApiResponse(
                        responseCode = "401",
                        description = "인증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "404",
                        description = "매장을 찾을 수 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<StoreResponse> getStore(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "매장 수정", description = "매장 정보를 수정합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "수정 성공",
                        content = @Content(schema = @Schema(implementation = StoreResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "401",
                        description = "인증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "404",
                        description = "매장을 찾을 수 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<StoreResponse> updateStore(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Valid @RequestBody StoreUpdateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);

    @Operation(summary = "매장 삭제", description = "매장을 삭제합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "204", description = "삭제 성공"),
                @ApiResponse(
                        responseCode = "401",
                        description = "인증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "404",
                        description = "매장을 찾을 수 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<Void> deleteStore(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(hidden = true) @AuthenticationPrincipal OwnerPrincipal principal);
}
