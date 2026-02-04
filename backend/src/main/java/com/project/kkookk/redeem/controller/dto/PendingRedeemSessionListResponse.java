package com.project.kkookk.redeem.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "대기 중인 리딤 세션 목록 응답")
public record PendingRedeemSessionListResponse(
        @Schema(description = "대기 중인 리딤 세션 목록") List<PendingRedeemSessionItem> sessions,
        @Schema(description = "총 개수", example = "3") int totalCount) {

    public static PendingRedeemSessionListResponse of(List<PendingRedeemSessionItem> sessions) {
        return new PendingRedeemSessionListResponse(sessions, sessions.size());
    }
}
