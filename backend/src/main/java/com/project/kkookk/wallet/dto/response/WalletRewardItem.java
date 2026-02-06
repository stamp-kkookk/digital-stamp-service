package com.project.kkookk.wallet.dto.response;

import com.project.kkookk.stampcard.domain.StampCardDesignType;
import com.project.kkookk.wallet.domain.WalletRewardStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "지갑 리워드 항목")
public record WalletRewardItem(
        @Schema(description = "리워드 ID", example = "1") Long id,
        @Schema(description = "매장 정보") StoreInfo store,
        @Schema(description = "리워드명", example = "아메리카노 1잔") String rewardName,
        @Schema(description = "스탬프카드 제목", example = "꾹꾹 스탬프") String stampCardTitle,
        @Schema(description = "리워드 상태") WalletRewardStatus status,
        @Schema(description = "발급일시") LocalDateTime issuedAt,
        @Schema(description = "만료일시") LocalDateTime expiresAt,
        @Schema(description = "사용일시 (사용한 경우)") LocalDateTime redeemedAt,
        @Schema(description = "스탬프카드 디자인 타입") StampCardDesignType designType,
        @Schema(description = "스탬프카드 디자인 JSON") String designJson) {}
