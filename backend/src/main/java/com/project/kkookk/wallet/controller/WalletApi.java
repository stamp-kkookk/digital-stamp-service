package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.dto.WalletAccessRequest;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "Wallet", description = "고객 지갑 API")
@RequestMapping("/api/public/wallet")
public interface WalletApi {

    @Operation(summary = "지갑 생성", description = "OTP 인증 완료 후 고객 지갑을 생성하고 JWT 토큰을 발급합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "201",
                        description = "지갑 생성 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                WalletRegisterResponse.class))),
                @ApiResponse(responseCode = "400", description = "잘못된 요청 형식"),
                @ApiResponse(responseCode = "409", description = "이미 등록된 전화번호")
            })
    @PostMapping("/register")
    ResponseEntity<WalletRegisterResponse> register(
            @Valid @RequestBody WalletRegisterRequest request);

    @Operation(
            summary = "지갑 접근",
            description = "전화번호와 이름으로 기존 지갑을 조회합니다. Rate Limit: 60초에 1회")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "지갑 조회 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                WalletAccessResponse.class))),
                @ApiResponse(responseCode = "400", description = "잘못된 요청 형식"),
                @ApiResponse(responseCode = "403", description = "차단된 지갑"),
                @ApiResponse(responseCode = "404", description = "지갑을 찾을 수 없음 (전화번호 또는 이름 불일치)"),
                @ApiResponse(responseCode = "429", description = "요청 제한 초과 (60초 쿨다운)")
            })
    @PostMapping("/access")
    ResponseEntity<WalletAccessResponse> accessWallet(
            @Valid @RequestBody WalletAccessRequest request);
}
