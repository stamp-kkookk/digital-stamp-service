package com.project.kkookk.issuance.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "적립 요청 생성")
public record CreateIssuanceRequest(
        @Schema(description = "매장 ID", example = "1") @NotNull(message = "매장 ID는 필수입니다")
                Long storeId,
        @Schema(description = "지갑 스탬프카드 ID", example = "10")
                @NotNull(message = "지갑 스탬프카드 ID는 필수입니다")
                Long walletStampCardId,
        @Schema(
                        description = "멱등성 키 (중복 요청 방지, UUID 권장)",
                        example = "550e8400-e29b-41d4-a716-446655440000")
                @NotBlank(message = "멱등성 키는 필수입니다")
                @Size(max = 64, message = "멱등성 키는 64자 이하여야 합니다")
                String idempotencyKey) {}
