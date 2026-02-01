package com.project.kkookk.otp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "OTP 검증 요청 DTO")
public record OtpVerifyDto(
        @Schema(description = "전화번호", example = "010-1234-5678")
                @NotBlank(message = "전화번호는 필수입니다")
                @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "올바른 전화번호 형식이 아닙니다")
                String phone,
        @Schema(description = "OTP 코드 (6자리)", example = "123456")
                @NotBlank(message = "OTP 코드는 필수입니다")
                @Pattern(regexp = "^\\d{6}$", message = "OTP 코드는 6자리 숫자여야 합니다")
                String code) {}
