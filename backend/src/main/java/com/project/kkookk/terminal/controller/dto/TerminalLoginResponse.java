package com.project.kkookk.terminal.controller.dto;

import com.project.kkookk.store.domain.Store;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "터미널 로그인 응답 DTO")
public record TerminalLoginResponse(
        @Schema(description = "JWT 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                String accessToken,
        @Schema(description = "점주 ID", example = "1") Long ownerId,
        @Schema(description = "매장 ID", example = "1") Long storeId,
        @Schema(description = "매장 이름", example = "꾹꾹 카페") String storeName) {

    public static TerminalLoginResponse of(String accessToken, Long ownerId, Store store) {
        return new TerminalLoginResponse(accessToken, ownerId, store.getId(), store.getName());
    }
}
