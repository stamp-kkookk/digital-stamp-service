package com.project.kkookk.wallet.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "지갑 접근 요청 DTO")
public record WalletAccessRequest(
        @Schema(description = "전화번호", example = "010-1234-5678")
                @NotBlank(message = "전화번호는 필수입니다")
                @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "올바른 전화번호 형식이 아닙니다")
                String phone,
        @Schema(description = "이름", example = "홍길동")
                @NotBlank(message = "이름은 필수입니다")
                @Size(max = 50, message = "이름은 50자 이하여야 합니다")
                String name) {}
