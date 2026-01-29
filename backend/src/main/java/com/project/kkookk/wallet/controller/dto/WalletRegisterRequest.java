package com.project.kkookk.wallet.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WalletRegisterRequest(
        @Schema(description = "전화번호", example = "010-1234-5678")
                @NotBlank(message = "전화번호는 필수입니다")
                @Pattern(
                        regexp = "^01[0-9]-\\d{3,4}-\\d{4}$",
                        message = "전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)")
                String phone,
        @Schema(description = "검증 ID", example = "550e8400-e29b-41d4-a716-446655440000")
                @NotBlank(message = "검증 ID는 필수입니다")
                String verificationId,
        @Schema(description = "OTP 코드", example = "123456")
                @NotBlank(message = "OTP 코드는 필수입니다")
                @Pattern(regexp = "^\\d{6}$", message = "OTP 코드는 6자리 숫자입니다")
                String otpCode,
        @Schema(description = "이름", example = "홍길동")
                @NotBlank(message = "이름은 필수입니다")
                @Size(max = 50, message = "이름은 50자를 초과할 수 없습니다")
                String name,
        @Schema(description = "닉네임", example = "길동이")
                @NotBlank(message = "닉네임은 필수입니다")
                @Size(max = 50, message = "닉네임은 50자를 초과할 수 없습니다")
                String nickname) {}
