package com.project.kkookk.otp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OTP 검증 응답")
public record OtpVerifyResponse(
        @Schema(description = "검증 성공 여부", example = "true") boolean verified) {}
