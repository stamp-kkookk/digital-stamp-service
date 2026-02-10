package com.project.kkookk.redeem.controller.owner.dto;

import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.domain.RedeemEventType;
import com.project.kkookk.redeem.repository.RedeemEventProjection;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "리딤 이벤트 응답")
public record RedeemEventResponse(
        @Schema(description = "이벤트 ID", example = "1") Long id,
        @Schema(description = "리딤 세션 ID", example = "100") Long redeemSessionId,
        @Schema(description = "고객 닉네임", example = "커피러버") String customerNickname,
        @Schema(description = "리워드 이름", example = "아메리카노 1잔") String rewardName,
        @Schema(description = "스탬프카드 제목", example = "커피전문점 스탬프카드") String stampCardTitle,
        @Schema(description = "이벤트 타입", example = "COMPLETED") RedeemEventType type,
        @Schema(description = "이벤트 결과", example = "SUCCESS") RedeemEventResult result,
        @Schema(description = "발생 일시", example = "2026-02-04T14:30:00") LocalDateTime occurredAt) {

    public static RedeemEventResponse from(RedeemEventProjection projection) {
        return new RedeemEventResponse(
                projection.getId(),
                projection.getRedeemSessionId(),
                projection.getCustomerNickname(),
                projection.getRewardName(),
                projection.getStampCardTitle(),
                projection.getType(),
                projection.getResult(),
                projection.getOccurredAt());
    }
}
