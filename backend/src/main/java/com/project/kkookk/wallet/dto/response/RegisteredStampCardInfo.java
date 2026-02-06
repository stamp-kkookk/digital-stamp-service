package com.project.kkookk.wallet.dto.response;

import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardDesignType;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.wallet.domain.WalletStampCard;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "지갑 생성 시 발급된 스탬프카드 정보")
public record RegisteredStampCardInfo(
        @Schema(description = "지갑 스탬프카드 ID", example = "1") Long walletStampCardId,
        @Schema(description = "스탬프카드 ID", example = "10") Long stampCardId,
        @Schema(description = "스탬프카드 제목", example = "아메리카노 10잔 쿠폰") String title,
        @Schema(description = "목표 스탬프 개수", example = "10") Integer goalStampCount,
        @Schema(description = "디자인 타입", example = "COLOR") StampCardDesignType designType,
        @Schema(description = "디자인 JSON", example = "{\"bgColor\": \"#FFFFFF\"}") String designJson,
        @Schema(description = "매장 이름", example = "꾹꾹 카페") String storeName) {

    public static RegisteredStampCardInfo from(
            WalletStampCard walletStampCard, StampCard stampCard, Store store) {
        return new RegisteredStampCardInfo(
                walletStampCard.getId(),
                stampCard.getId(),
                stampCard.getTitle(),
                stampCard.getGoalStampCount(),
                stampCard.getDesignType(),
                stampCard.getDesignJson(),
                store.getName());
    }
}
