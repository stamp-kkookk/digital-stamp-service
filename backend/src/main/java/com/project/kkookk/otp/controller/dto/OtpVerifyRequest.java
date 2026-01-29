package com.project.kkookk.otp.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpVerifyRequest(
        @NotBlank(message = "전화번호는 필수입니다")
                @Pattern(
                        regexp = "^01[0-9]-\\d{4}-\\d{4}$",
                        message = "전화번호는 010-1234-5678 형식이어야 합니다")
                @Schema(description = "전화번호", example = "010-1234-5678")
                String phone,
        @NotBlank(message = "검증 ID는 필수입니다")
                @Schema(
                        description = "검증 ID (OTP 요청 시 받은 값)",
                        example = "550e8400-e29b-41d4-a716-446655440000")
                String verificationId,
        @NotBlank(message = "OTP 코드는 필수입니다")
                @Pattern(regexp = "^\\d{6}$", message = "OTP 코드는 6자리 숫자여야 합니다")
                @Schema(description = "OTP 코드", example = "123456")
                String otpCode) {}
