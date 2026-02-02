package com.project.kkookk.redeem.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.redeem.controller.dto.CreateRedeemSessionRequest;
import com.project.kkookk.redeem.controller.dto.RedeemSessionResponse;
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
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Customer Redeem", description = "고객 리워드 사용 API")
@SecurityRequirement(name = "bearerAuth")
public interface CustomerRedeemApi {

    @Operation(summary = "리워드 사용 세션 생성", description = "리워드 사용을 위한 세션을 생성합니다. TTL 60초")
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                description = "세션 생성 성공",
                content = @Content(schema = @Schema(implementation = RedeemSessionResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "리워드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "리워드 사용 불가 또는 이미 진행 중인 세션 존재",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<RedeemSessionResponse> createRedeemSession(
            @Valid @RequestBody CreateRedeemSessionRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomerPrincipal principal);
}
