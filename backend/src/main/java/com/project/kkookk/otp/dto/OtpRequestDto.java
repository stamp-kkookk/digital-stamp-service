package com.project.kkookk.otp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "OTP 요청 DTO")
public record OtpRequestDto(
        @Schema(description = "전화번호", example = "010-1234-5678")
                @NotBlank(message = "전화번호는 필수입니다")
                @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "올바른 전화번호 형식이 아닙니다")
                String phone) {}
