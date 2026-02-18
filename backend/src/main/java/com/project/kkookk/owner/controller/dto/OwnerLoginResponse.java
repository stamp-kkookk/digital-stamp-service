package com.project.kkookk.owner.controller.dto;

import com.project.kkookk.owner.domain.OwnerAccount;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "점주 로그인 응답")
public record OwnerLoginResponse(
        @Schema(description = "JWT 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                String accessToken,
        @Schema(description = "리프레시 토큰", example = "550e8400-e29b-41d4-a716-446655440000")
                String refreshToken,
        @Schema(description = "점주 계정 ID", example = "1") Long id,
        @Schema(description = "이메일", example = "owner@example.com") String email,
        @Schema(description = "이름", example = "홍길동") String name,
        @Schema(description = "전화번호", example = "010-1234-5678") String phoneNumber) {

    public static OwnerLoginResponse of(
            String accessToken, String refreshToken, OwnerAccount ownerAccount) {
        return new OwnerLoginResponse(
                accessToken,
                refreshToken,
                ownerAccount.getId(),
                ownerAccount.getEmail(),
                ownerAccount.getName(),
                ownerAccount.getPhoneNumber());
    }
}
