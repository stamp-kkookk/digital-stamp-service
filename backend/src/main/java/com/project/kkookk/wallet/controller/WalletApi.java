package com.project.kkookk.wallet.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.wallet.controller.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.controller.dto.WalletRegisterResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Wallet", description = "고객 지갑 API")
public interface WalletApi {

    @Operation(summary = "지갑 생성", description = "OTP 검증 후 고객 지갑을 최초 생성합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "지갑 생성 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                WalletRegisterResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패 또는 OTP 검증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "409",
                        description = "이미 등록된 전화번호",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<WalletRegisterResponse> registerWallet(
            @Valid @RequestBody WalletRegisterRequest request);
}
