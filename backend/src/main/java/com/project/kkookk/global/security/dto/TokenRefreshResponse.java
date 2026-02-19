package com.project.kkookk.global.security.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "토큰 갱신 응답 DTO")
public record TokenRefreshResponse(
        @Schema(description = "새로운 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                String accessToken,
        @Schema(description = "새로운 리프레시 토큰", example = "550e8400-e29b-41d4-a716-446655440000")
                String refreshToken) {}
