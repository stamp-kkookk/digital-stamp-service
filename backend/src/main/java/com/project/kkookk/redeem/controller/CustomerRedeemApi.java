package com.project.kkookk.redeem.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.redeem.controller.dto.RedeemRewardRequest;
import com.project.kkookk.redeem.controller.dto.RedeemRewardResponse;
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

    @Operation(summary = "리워드 사용", description = "리워드를 즉시 사용 처리합니다.")
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                description = "리워드 사용 성공",
                content = @Content(schema = @Schema(implementation = RedeemRewardResponse.class))),
        @ApiResponse(
                responseCode = "404",
                description = "리워드 없음",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "409",
                description = "리워드 사용 불가",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(
                responseCode = "410",
                description = "리워드 만료됨",
                content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<RedeemRewardResponse> redeemReward(
            @Valid @RequestBody RedeemRewardRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal CustomerPrincipal principal);
}
