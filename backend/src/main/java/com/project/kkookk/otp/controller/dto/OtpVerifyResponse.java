package com.project.kkookk.otp.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record OtpVerifyResponse(
        @Schema(description = "검증 성공 여부", example = "true") boolean verified,
        @Schema(description = "전화번호", example = "010-1234-5678") String phone) {

    public static OtpVerifyResponse of(boolean verified, String phone) {
        return new OtpVerifyResponse(verified, phone);
    }
}
