package com.project.kkookk.wallet.controller.customer;

import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.domain.WalletRewardStatus;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.WalletRewardListResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Customer Wallet", description = "고객 지갑 관련 API")
public interface CustomerWalletApi {

    @Operation(summary = "내 스탬프카드 목록 조회 (JWT 인증 필요)", description = "로그인된 고객의 보유 스탬프카드 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 필요 (JWT 토큰 없음/만료)")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/customer/wallet/my-stamp-cards")
    ResponseEntity<WalletStampCardListResponse> getMyStampCards(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Parameter(description = "정렬 기준 (기본값: LAST_STAMPED)")
                    @RequestParam(defaultValue = "LAST_STAMPED")
                    StampCardSortType sortBy);

    @Operation(
            summary = "스탬프 적립 히스토리 조회 (StepUp 토큰 필수)",
            description =
                    """
            특정 매장의 스탬프 적립 이력을 페이징하여 조회합니다.
            OTP 인증 후 발급된 StepUp 토큰이 필요합니다.
            """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 페이징 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 필요 (JWT 토큰 없음/만료)"),
        @ApiResponse(responseCode = "403", description = "StepUp 인증 필요"),
        @ApiResponse(responseCode = "404", description = "해당 매장의 스탬프카드를 찾을 수 없음")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/customer/wallet/stores/{storeId}/stamp-history")
    ResponseEntity<StampEventHistoryResponse> getStampHistory(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "페이지 번호 (0-based)") @RequestParam(defaultValue = "0") @Min(0)
                    int page,
            @Parameter(description = "페이지 크기 (1~100)")
                    @RequestParam(defaultValue = "20")
                    @Min(1)
                    @Max(100)
                    int size);

    @Operation(
            summary = "리워드 사용 히스토리 조회 (StepUp 토큰 필수)",
            description =
                    """
            특정 매장의 리워드 사용 이력을 페이징하여 조회합니다.
            OTP 인증 후 발급된 StepUp 토큰이 필요합니다.
            """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 페이징 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 필요 (JWT 토큰 없음/만료)"),
        @ApiResponse(responseCode = "403", description = "StepUp 인증 필요"),
        @ApiResponse(responseCode = "404", description = "해당 매장의 스탬프카드를 찾을 수 없음")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/customer/wallet/stores/{storeId}/redeem-history")
    ResponseEntity<RedeemEventHistoryResponse> getRedeemHistory(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId,
            @Parameter(description = "페이지 번호 (0-based)") @RequestParam(defaultValue = "0") @Min(0)
                    int page,
            @Parameter(description = "페이지 크기 (1~100)")
                    @RequestParam(defaultValue = "20")
                    @Min(1)
                    @Max(100)
                    int size);

    @Operation(
            summary = "리워드 보관함 조회 (StepUp 토큰 필수)",
            description =
                    """
            인증된 고객의 보유 리워드(쿠폰) 목록을 페이징하여 조회합니다.
            상태별 필터링이 가능합니다. OTP 인증 후 발급된 StepUp 토큰이 필요합니다.
            """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 페이징 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 필요 (JWT 토큰 없음/만료)"),
        @ApiResponse(responseCode = "403", description = "StepUp 인증 필요")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/customer/wallet/rewards")
    ResponseEntity<WalletRewardListResponse> getRewards(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Parameter(description = "리워드 상태 필터 (미지정 시 전체 조회)") @RequestParam(required = false)
                    WalletRewardStatus status,
            @Parameter(description = "페이지 번호 (0-based)") @RequestParam(defaultValue = "0") @Min(0)
                    int page,
            @Parameter(description = "페이지 크기 (1~100)")
                    @RequestParam(defaultValue = "20")
                    @Min(1)
                    @Max(100)
                    int size);
}
