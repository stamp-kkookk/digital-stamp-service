package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.dto.CustomerLoginRequest;
import com.project.kkookk.wallet.dto.CustomerLoginResponse;
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
            summary = "고객 로그인",
            description = "전화번호와 이름으로 기존 고객 로그인을 수행합니다. 해당 매장의 스탬프카드가 없으면 자동 발급합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "로그인 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                CustomerLoginResponse.class))),
                @ApiResponse(responseCode = "400", description = "잘못된 요청 형식"),
                @ApiResponse(responseCode = "404", description = "고객 정보를 찾을 수 없음")
            })
    @PostMapping("/login")
    ResponseEntity<CustomerLoginResponse> login(@Valid @RequestBody CustomerLoginRequest request);
}
