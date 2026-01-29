package com.project.kkookk.wallet.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "지갑 정보 조회 요청 DTO")
public record WalletAccessRequest(
    @Schema(description = "휴대폰 번호", example = "01012345678")
    @NotBlank
    @Pattern(regexp = "^01(?:0|1|[6-9])(?:\\d{3}|\\d{4})\\d{4}$", message = "Invalid phone number format")
    String phoneNumber,

    @Schema(description = "사용자 이름", example = "홍길동")
    @NotBlank
    @Size(min = 2, max = 50)
    String userName
) {}
