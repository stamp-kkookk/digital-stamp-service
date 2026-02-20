package com.project.kkookk.migration.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.migration.dto.CreateMigrationRequest;
import com.project.kkookk.migration.dto.MigrationListItemResponse;
import com.project.kkookk.migration.dto.MigrationRequestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Customer Migration", description = "고객 스탬프 마이그레이션 API")
@SecurityRequirement(name = "bearerAuth")
public interface CustomerMigrationApi {

    @Operation(
            summary = "스탬프 마이그레이션 요청 생성",
            description =
                    """
                종이 스탬프 판 이미지(Base64)와 개수를 제출하여 디지털 전환 요청.
                - Wallet당 매장별 1회 제한 (SUBMITTED 상태 중복 불가)
                - 승인/반려된 요청은 재신청 가능
                - 이미지는 Base64 인코딩, 최대 5MB
                - claimedStampCount는 백오피스에서 참고용(자동 완성)으로 사용되며, 사장님이 수정 가능
                """)
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "요청 생성 성공",
                content =
                        @Content(
                                schema = @Schema(implementation = MigrationRequestResponse.class))),
        @ApiResponse(
                responseCode = "400",
                description = "유효성 검증 실패",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요 (JWT 토큰 없음/만료)",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "403",
                description = "지갑이 차단됨 (BLOCKED 상태)",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "매장 또는 고객 지갑을 찾을 수 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "이미 처리 중인 마이그레이션 요청이 존재",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "413",
                description = "이미지 데이터가 너무 큼 (최대 5MB)",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/api/customer/migrations")
    ResponseEntity<MigrationRequestResponse> createMigrationRequest(
            @Valid @RequestBody CreateMigrationRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomerPrincipal principal);

    @Operation(
            summary = "마이그레이션 요청 상태 조회",
            description =
                    """
                제출된 마이그레이션 요청의 처리 상태 확인.
                - SUBMITTED: 제출됨 (심사 대기)
                - APPROVED: 승인됨 (스탬프 반영 완료)
                - REJECTED: 반려됨 (사유 포함)
                - SLA: 24~48시간 이내 처리 예정
                """)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "조회 성공",
                content =
                        @Content(
                                schema = @Schema(implementation = MigrationRequestResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요 (JWT 토큰 없음/만료)",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "403",
                description = "권한 없음 (다른 고객의 마이그레이션 요청)",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "마이그레이션 요청을 찾을 수 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/api/customer/migrations/{id}")
    ResponseEntity<MigrationRequestResponse> getMigrationRequest(
            @Parameter(description = "마이그레이션 요청 ID", example = "1") @PathVariable Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomerPrincipal principal);

    @Operation(
            summary = "내 마이그레이션 요청 목록 조회",
            description =
                    """
                인증된 사용자의 모든 마이그레이션 요청 목록을 조회합니다.
                - 최신순 정렬 (requestedAt DESC)
                - 이미지 데이터는 제외되며, 상세 조회 API에서 확인 가능
                - 반려된 요청의 경우 rejectReason 포함
                """)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "조회 성공",
                content =
                        @Content(
                                schema =
                                        @Schema(implementation = MigrationListItemResponse.class))),
        @ApiResponse(
                responseCode = "401",
                description = "인증 필요 (JWT 토큰 없음/만료)",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/api/customer/migrations")
    ResponseEntity<List<MigrationListItemResponse>> getMyMigrationRequests(
            @Parameter(hidden = true) @AuthenticationPrincipal CustomerPrincipal principal);
}
