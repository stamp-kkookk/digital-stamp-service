package com.project.kkookk.wallet.controller.dto;

import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

public record WalletRegisterResponse(
        @Schema(description = "지갑 ID", example = "1") Long walletId,
        @Schema(description = "전화번호", example = "010-1234-5678") String phone,
        @Schema(description = "이름", example = "홍길동") String name,
        @Schema(description = "닉네임", example = "길동이") String nickname,
        @Schema(description = "지갑 상태", example = "ACTIVE") CustomerWalletStatus status,
        @Schema(description = "생성일시", example = "2026-01-28T10:30:00") LocalDateTime createdAt) {

    public static WalletRegisterResponse from(CustomerWallet wallet) {
        return new WalletRegisterResponse(
                wallet.getId(),
                wallet.getPhone(),
                wallet.getName(),
                wallet.getNickname(),
                wallet.getStatus(),
                wallet.getCreatedAt());
    }
}
