package com.project.kkookk.redeem.controller.dto;

import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.domain.RedeemSessionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Duration;
import java.time.LocalDateTime;

@Schema(description = "리워드 사용 세션 응답")
public record RedeemSessionResponse(
        @Schema(description = "세션 ID", example = "1") Long sessionId,
        @Schema(description = "지갑 리워드 ID", example = "10") Long walletRewardId,
        @Schema(description = "세션 상태", example = "PENDING") RedeemSessionStatus status,
        @Schema(description = "만료 시각", example = "2026-02-02T15:30:00") LocalDateTime expiresAt,
        @Schema(description = "남은 시간 (초)", example = "58") Long remainingSeconds,
        @Schema(description = "생성 시각") LocalDateTime createdAt) {

    public static RedeemSessionResponse from(RedeemSession session) {
        LocalDateTime now = LocalDateTime.now();
        long remaining = Duration.between(now, session.getExpiresAt()).getSeconds();

        return new RedeemSessionResponse(
                session.getId(),
                session.getWalletRewardId(),
                session.getStatus(),
                session.getExpiresAt(),
                Math.max(0, remaining),
                session.getCreatedAt());
    }
}
