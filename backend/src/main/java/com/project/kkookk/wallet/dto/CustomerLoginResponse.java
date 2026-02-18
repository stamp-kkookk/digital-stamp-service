package com.project.kkookk.wallet.dto;

import com.project.kkookk.wallet.dto.response.WalletStampCardSummary;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "고객 로그인 응답 DTO")
public record CustomerLoginResponse(
        @Schema(description = "JWT 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                String accessToken,
        @Schema(description = "리프레시 토큰", example = "550e8400-e29b-41d4-a716-446655440000")
                String refreshToken,
        @Schema(description = "지갑 ID", example = "1") Long walletId,
        @Schema(description = "전화번호", example = "010-1234-5678") String phone,
        @Schema(description = "이름", example = "홍길동") String name,
        @Schema(description = "닉네임", example = "길동이") String nickname,
        @Schema(description = "보유 스탬프카드 목록 (현재 매장 카드가 첫 번째)")
                List<WalletStampCardSummary> stampCards) {}
