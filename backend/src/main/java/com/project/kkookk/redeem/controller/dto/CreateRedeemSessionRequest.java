package com.project.kkookk.redeem.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "리워드 사용 세션 생성 요청")
public record CreateRedeemSessionRequest(
        @Schema(description = "지갑 리워드 ID", example = "1")
                @NotNull(message = "지갑 리워드 ID는 필수입니다")
                Long walletRewardId) {}
