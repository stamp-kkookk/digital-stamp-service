package com.project.kkookk.wallet.controller;

import com.project.kkookk.wallet.dto.WalletAccessRequest;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Wallet (Public)", description = "공용 지갑 조회 API")
public interface WalletApi {

    @Operation(
            summary = "지갑 정보 조회",
            description = "전화번호와 이름으로 사용자의 지갑 정보를 조회합니다. 터미널에서 사용됩니다.",
            responses = {
                @ApiResponse(
                        responseCode = "200",
                        description = "조회 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                WalletAccessResponse.class))),
                @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터"),
                @ApiResponse(responseCode = "404", description = "지갑 또는 매장 정보를 찾을 수 없음")
            })
    @GetMapping("/api/public/wallet/access")
    ResponseEntity<WalletAccessResponse> getWalletAccessInfo(
            @Parameter(description = "지갑 조회 요청 정보", in = ParameterIn.QUERY) @Valid @ModelAttribute
                    WalletAccessRequest request,
            @Parameter(description = "매장 ID", required = true, example = "1") @RequestParam
                    Long storeId);
}
