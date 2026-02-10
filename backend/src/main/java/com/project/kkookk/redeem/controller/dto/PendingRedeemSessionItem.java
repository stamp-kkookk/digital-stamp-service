package com.project.kkookk.redeem.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "대기 중인 리딤 세션 항목")
public record PendingRedeemSessionItem(
        @Schema(description = "리딤 세션 ID", example = "1") Long sessionId,
        @Schema(description = "고객 닉네임", example = "커피러버") String customerNickname,
        @Schema(description = "리워드명", example = "아메리카노 1잔") String rewardName,
        @Schema(description = "남은 시간 (초)", example = "45") long remainingSeconds,
        @Schema(description = "세션 생성 시간") LocalDateTime createdAt) {}
