package com.project.kkookk.otp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OTP 검증 응답")
public record OtpVerifyResponse(
        @Schema(description = "검증 성공 여부", example = "true") boolean verified,
        @Schema(
                        description = "StepUp 토큰 (검증 성공 시 발급, 민감 기능 접근용, 10분 TTL)",
                        example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                String stepUpToken) {

    public static OtpVerifyResponse success(String stepUpToken) {
        return new OtpVerifyResponse(true, stepUpToken);
    }

    public static OtpVerifyResponse failure() {
        return new OtpVerifyResponse(false, null);
    }
}
