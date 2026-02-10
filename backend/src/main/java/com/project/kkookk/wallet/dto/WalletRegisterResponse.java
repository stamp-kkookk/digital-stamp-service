package com.project.kkookk.wallet.dto;

import com.project.kkookk.wallet.dto.response.RegisteredStampCardInfo;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "지갑 생성 응답 DTO")
public record WalletRegisterResponse(
        @Schema(description = "JWT 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                String accessToken,
        @Schema(description = "지갑 ID", example = "1") Long walletId,
        @Schema(description = "전화번호", example = "010-1234-5678") String phone,
        @Schema(description = "이름", example = "홍길동") String name,
        @Schema(description = "닉네임", example = "길동이") String nickname,
        @Schema(description = "발급된 스탬프카드 정보 (매장 진입 시에만)") RegisteredStampCardInfo stampCard) {}
