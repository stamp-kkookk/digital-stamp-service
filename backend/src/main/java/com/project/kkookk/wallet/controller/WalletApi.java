package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.dto.NicknameCheckResponse;
import com.project.kkookk.wallet.dto.PhoneCheckResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Wallet", description = "고객 지갑 API")
@RequestMapping("/api/public/wallet")
public interface WalletApi {

    @Operation(summary = "닉네임 중복 체크", description = "닉네임 사용 가능 여부를 확인합니다.")
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
                                                                NicknameCheckResponse.class)))
            })
    @GetMapping("/check-nickname")
    ResponseEntity<NicknameCheckResponse> checkNickname(
            @Parameter(description = "확인할 닉네임", example = "길동이") @RequestParam String nickname);

    @Operation(summary = "전화번호 중복 체크", description = "전화번호 사용 가능 여부를 확인합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "조회 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(implementation = PhoneCheckResponse.class)))
            })
    @GetMapping("/check-phone")
    ResponseEntity<PhoneCheckResponse> checkPhone(
            @Parameter(description = "확인할 전화번호", example = "01012345678") @RequestParam
                    String phone);
}
