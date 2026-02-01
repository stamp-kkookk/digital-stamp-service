package com.project.kkookk.otp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OTP 요청 응답")
public record OtpRequestResponse(
        @Schema(description = "요청 성공 여부", example = "true") boolean success) {}
