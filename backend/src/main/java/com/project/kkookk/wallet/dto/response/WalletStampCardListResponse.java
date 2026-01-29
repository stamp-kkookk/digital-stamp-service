package com.project.kkookk.wallet.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "고객 지갑 스탬프카드 목록 응답")
public record WalletStampCardListResponse(
        @Schema(description = "고객 지갑 ID", example = "123") Long customerWalletId,
        @Schema(description = "고객 이름", example = "홍길동") String customerName,
        @Schema(description = "보유 스탬프카드 목록") List<WalletStampCardSummary> stampCards) {}
