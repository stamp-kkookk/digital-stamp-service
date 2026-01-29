package com.project.kkookk.wallet.dto;

import com.project.kkookk.wallet.domain.CustomerWallet;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import lombok.Builder;

@Schema(description = "지갑 정보 조회 응답 DTO")
public record WalletAccessResponse(
    @Schema(description = "사용자(지갑) ID")
    Long userId,

    @Schema(description = "사용자 이름")
    String userName,

    @Schema(description = "휴대폰 번호")
    String phoneNumber,

    @Schema(description = "해당 매장의 스탬프 카드 정보")
    StampCardInfo stampCardInfo
) {
    public static WalletAccessResponse of(CustomerWallet wallet, StampCardInfo stampCardInfo) {
        return new WalletAccessResponse(
            wallet.getId(),
            wallet.getName(),
            wallet.getPhone(),
            stampCardInfo
        );
    }
}
