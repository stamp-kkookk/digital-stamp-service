package com.project.kkookk.global.security.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "토큰 갱신 요청 DTO")
public record TokenRefreshRequest(
        @NotBlank(message = "리프레시 토큰은 필수입니다")
                @Schema(description = "리프레시 토큰", example = "550e8400-e29b-41d4-a716-446655440000")
                String refreshToken) {}
