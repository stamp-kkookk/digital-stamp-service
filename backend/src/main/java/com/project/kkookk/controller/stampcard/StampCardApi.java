package com.project.kkookk.controller.stampcard;

import com.project.kkookk.controller.stampcard.dto.CreateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.StampCardListResponse;
import com.project.kkookk.controller.stampcard.dto.StampCardResponse;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.global.response.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "StampCard", description = "스탬프 카드 관리 API (Owner 전용)")
@SecurityRequirement(name = "bearerAuth")
public interface StampCardApi {

    @Operation(summary = "스탬프 카드 생성", description = "새로운 스탬프 카드를 생성합니다. 초기 상태는 DRAFT입니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "생성 성공"),
        @ApiResponse(
                responseCode = "400",
                description = "유효성 검증 실패",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<StampCardResponse> create(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Valid @RequestBody CreateStampCardRequest request);

    @Operation(summary = "스탬프 카드 목록 조회", description = "매장의 스탬프 카드 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<StampCardListResponse> getList(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "상태 필터") @RequestParam(required = false)
                    StampCardStatus status,
            @Parameter(hidden = true) Pageable pageable);

    @Operation(summary = "스탬프 카드 상세 조회", description = "스탬프 카드의 상세 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "스탬프 카드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<StampCardResponse> getById(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "스탬프 카드 ID", required = true) @PathVariable Long id);

    @Operation(
            summary = "스탬프 카드 수정",
            description = "스탬프 카드를 수정합니다. ACTIVE 상태에서는 title, designJson만 수정 가능합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(
                responseCode = "400",
                description = "유효성 검증 실패 또는 수정 불가",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "스탬프 카드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<StampCardResponse> update(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "스탬프 카드 ID", required = true) @PathVariable Long id,
            @Valid @RequestBody UpdateStampCardRequest request);

    @Operation(
            summary = "스탬프 카드 상태 변경",
            description = "스탬프 카드의 상태를 변경합니다. Store당 ACTIVE 카드는 1개만 가능합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "상태 변경 성공"),
        @ApiResponse(
                responseCode = "400",
                description = "유효하지 않은 상태 전이",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "스탬프 카드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "이미 활성화된 카드 존재",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<StampCardResponse> updateStatus(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "스탬프 카드 ID", required = true) @PathVariable Long id,
            @Valid @RequestBody UpdateStampCardStatusRequest request);

    @Operation(summary = "스탬프 카드 삭제", description = "DRAFT 상태의 스탬프 카드만 삭제할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(
                responseCode = "400",
                description = "DRAFT 상태가 아님",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "스탬프 카드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> delete(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "스탬프 카드 ID", required = true) @PathVariable Long id);
}
