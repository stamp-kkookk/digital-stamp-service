package com.project.kkookk.wallet.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "지갑 접근 응답 DTO")
public record WalletAccessResponse(
        @Schema(description = "지갑 ID", example = "1") Long walletId,
        @Schema(description = "전화번호", example = "010-1234-5678") String phone,
        @Schema(description = "이름", example = "홍길동") String name,
        @Schema(description = "닉네임", example = "길동이") String nickname) {}
