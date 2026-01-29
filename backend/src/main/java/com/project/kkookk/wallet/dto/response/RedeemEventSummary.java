package com.project.kkookk.wallet.dto.response;

import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.domain.RedeemEventType;
import com.project.kkookk.store.domain.Store;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "리워드 사용 이벤트 요약 정보")
public record RedeemEventSummary(
        @Schema(description = "리워드 이벤트 ID", example = "456") Long id,
        @Schema(description = "세션 ID", example = "789") Long redeemSessionId,
        @Schema(description = "매장 정보") StoreInfo store,
        @Schema(description = "이벤트 타입", example = "COMPLETED") RedeemEventType type,
        @Schema(description = "결과", example = "SUCCESS") RedeemEventResult result,
        @Schema(description = "발생 일시", example = "2026-01-28T15:00:00") LocalDateTime occurredAt) {

    public static RedeemEventSummary from(RedeemEvent event, Store store) {
        return new RedeemEventSummary(
                event.getId(),
                event.getRedeemSessionId(),
                StoreInfo.from(store),
                event.getType(),
                event.getResult(),
                event.getOccurredAt());
    }
}
