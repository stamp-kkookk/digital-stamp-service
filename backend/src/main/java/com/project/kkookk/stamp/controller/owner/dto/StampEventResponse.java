package com.project.kkookk.stamp.controller.owner.dto;

import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventProjection;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "스탬프 이벤트 응답")
public record StampEventResponse(
        @Schema(description = "이벤트 ID", example = "1") Long id,
        @Schema(description = "지갑 스탬프카드 ID", example = "10") Long walletStampCardId,
        @Schema(description = "고객 이름", example = "홍길동") String customerName,
        @Schema(description = "고객 전화번호", example = "010-1234-5678") String customerPhone,
        @Schema(description = "이벤트 타입", example = "EARN") StampEventType type,
        @Schema(description = "스탬프 변화량", example = "1") Integer delta,
        @Schema(description = "사유", example = "스탬프 적립") String reason,
        @Schema(description = "발생 일시", example = "2026-02-04T14:30:00") LocalDateTime occurredAt) {

    public static StampEventResponse from(StampEventProjection projection) {
        return new StampEventResponse(
                projection.getId(),
                projection.getWalletStampCardId(),
                projection.getCustomerName(),
                projection.getCustomerPhone(),
                projection.getType(),
                projection.getDelta(),
                projection.getReason(),
                projection.getOccurredAt());
    }
}
