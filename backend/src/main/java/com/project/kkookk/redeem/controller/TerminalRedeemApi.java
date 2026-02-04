package com.project.kkookk.redeem.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.TerminalPrincipal;
import com.project.kkookk.redeem.controller.dto.PendingRedeemSessionListResponse;
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

@Tag(name = "Terminal Redeem", description = "매장 단말 리딤 확인 API")
@SecurityRequirement(name = "bearerAuth")
public interface TerminalRedeemApi {

    @Operation(
            summary = "대기 중인 리딤 세션 목록 조회",
            description =
                    "매장의 PENDING 상태 리딤 세션 목록을 조회합니다. "
                            + "고객이 리딤을 시작하면 이 목록에 표시되며, "
                            + "매장에서 고객의 리딤 요청을 확인할 수 있습니다. "
                            + "만료된 세션은 자동으로 제외됩니다.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "조회 성공",
                content =
                        @Content(
                                schema =
                                        @Schema(
                                                implementation =
                                                        PendingRedeemSessionListResponse.class))),
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
    ResponseEntity<PendingRedeemSessionListResponse> getPendingRedeemSessions(
            @Parameter(description = "매장 ID", example = "1") @PathVariable Long storeId,
            @Parameter(hidden = true) @AuthenticationPrincipal TerminalPrincipal principal);
}
