package com.project.kkookk.otp.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record OtpRequestResponse(
        @Schema(description = "검증 ID", example = "550e8400-e29b-41d4-a716-446655440000")
                String verificationId,
        @Schema(description = "만료 시각", example = "2026-01-28T12:34:56") LocalDateTime expiresAt,
        @Schema(description = "OTP 코드 (개발 환경에서만 반환)", example = "123456") String otpCode) {

    public static OtpRequestResponse of(
            String verificationId, LocalDateTime expiresAt, String otpCode) {
        return new OtpRequestResponse(verificationId, expiresAt, otpCode);
    }
}
