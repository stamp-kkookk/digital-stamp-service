package com.project.kkookk.wallet.dto.response;

import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.domain.StampEventType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "스탬프 이벤트 요약 정보")
public record StampEventSummary(
        @Schema(description = "스탬프 이벤트 ID", example = "123") Long id,
        @Schema(description = "이벤트 타입", example = "ISSUED") StampEventType type,
        @Schema(description = "스탬프 증감량", example = "2") Integer delta,
        @Schema(description = "사유", example = "아메리카노 2잔 구매") String reason,
        @Schema(description = "발생 일시", example = "2026-01-28T14:30:00") LocalDateTime occurredAt) {

    public static StampEventSummary from(StampEvent event) {
        return new StampEventSummary(
                event.getId(),
                event.getType(),
                event.getDelta(),
                event.getReason(),
                event.getOccurredAt());
    }
}
