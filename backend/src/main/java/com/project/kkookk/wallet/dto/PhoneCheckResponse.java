package com.project.kkookk.wallet.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "전화번호 중복 체크 응답")
public record PhoneCheckResponse(
        @Schema(description = "사용 가능 여부", example = "true") boolean available) {}
