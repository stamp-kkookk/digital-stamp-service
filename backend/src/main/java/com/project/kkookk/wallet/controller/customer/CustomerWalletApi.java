package com.project.kkookk.wallet.controller.customer;

import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Customer Wallet", description = "고객 지갑 관련 API")
public interface CustomerWalletApi {

    @Operation(
            summary = "고객 지갑 홈 - 보유 스탬프카드 목록 조회 (인증 불필요)",
            description = "전화번호와 이름으로 고객 지갑을 조회하고, 보유한 스탬프카드 목록을 반환합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "유효성 검증 실패 (잘못된 전화번호 형식, 이름 등)"),
        @ApiResponse(responseCode = "404", description = "해당 전화번호와 이름으로 지갑을 찾을 수 없음"),
        @ApiResponse(responseCode = "403", description = "지갑이 차단됨 (BLOCKED 상태)")
    })
    @GetMapping("/api/customer/wallet/stamp-cards")
    ResponseEntity<WalletStampCardListResponse> getStampCardsByPhoneAndName(
            @Parameter(description = "고객 전화번호 (형식: 010-1234-5678)", required = true)
                    @RequestParam
                    @NotBlank(message = "전화번호는 필수입니다")
                    @Pattern(regexp = "^\\d{3}-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다")
                    String phone,
            @Parameter(description = "고객 이름", required = true)
                    @RequestParam
                    @NotBlank(message = "이름은 필수입니다")
                    @Size(min = 2, max = 50, message = "이름은 2~50자 이내여야 합니다")
                    String name,
            @Parameter(description = "정렬 기준 (기본값: LAST_STAMPED)")
                    @RequestParam(defaultValue = "LAST_STAMPED")
                    StampCardSortType sortBy);

    @Operation(
            summary = "스탬프 적립 히스토리 조회 (JWT 인증 필요)",
            description = "특정 스탬프카드의 적립 이력을 페이징하여 조회합니다. SMS 인증 후 발급된 JWT 토큰이 필요합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 페이징 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 필요 (JWT 토큰 없음/만료)"),
        @ApiResponse(responseCode = "403", description = "권한 없음 (다른 고객의 스탬프카드)"),
        @ApiResponse(responseCode = "404", description = "WalletStampCard를 찾을 수 없음")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/customer/wallet/stamp-cards/{walletStampCardId}/history")
    ResponseEntity<StampEventHistoryResponse> getStampHistory(
            @Parameter(description = "지갑 스탬프카드 ID", required = true) @PathVariable
                    Long walletStampCardId,
            @Parameter(description = "페이지 번호 (0-based)") @RequestParam(defaultValue = "0") @Min(0)
                    int page,
            @Parameter(description = "페이지 크기 (1~100)")
                    @RequestParam(defaultValue = "20")
                    @Min(1)
                    @Max(100)
                    int size);

    @Operation(
            summary = "리워드 사용 히스토리 조회 (JWT 인증 필요)",
            description = "인증된 고객의 리워드 사용 이력을 페이징하여 조회합니다. SMS 인증 후 발급된 JWT 토큰이 필요합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 페이징 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 필요 (JWT 토큰 없음/만료)")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/customer/wallet/redeem-history")
    ResponseEntity<RedeemEventHistoryResponse> getRedeemHistory(
            @Parameter(description = "페이지 번호 (0-based)") @RequestParam(defaultValue = "0") @Min(0)
                    int page,
            @Parameter(description = "페이지 크기 (1~100)")
                    @RequestParam(defaultValue = "20")
                    @Min(1)
                    @Max(100)
                    int size);
}
