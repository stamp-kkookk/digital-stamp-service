package com.project.kkookk.otp.dto;

import io.swagger.v3.oas.annotations.media.Schema;

// TODO: 시연용 - 프로덕션 배포 시 devOtpCode 필드 제거 필요
@Schema(description = "OTP 요청 응답")
public record OtpRequestResponse(
        @Schema(description = "요청 성공 여부", example = "true") boolean success,
        @Schema(description = "시연용 OTP 코드 (프로덕션에서 제거)", example = "123456") String devOtpCode) {}
