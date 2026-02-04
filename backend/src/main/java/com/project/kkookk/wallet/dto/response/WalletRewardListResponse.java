package com.project.kkookk.wallet.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "지갑 리워드 목록 응답")
public record WalletRewardListResponse(
        @Schema(description = "리워드 목록") List<WalletRewardItem> rewards,
        @Schema(description = "페이지 정보") PageInfo pageInfo) {}
