package com.project.kkookk.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

public record TerminalLoginResponse(
    @Schema(description = "액세스 토큰")
    String accessToken,

    @Schema(description = "리프레시 토큰")
    String refreshToken,

    @Schema(description = "매장 ID")
    Long storeId,

    @Schema(description = "매장 이름")
    String storeName
) {}
