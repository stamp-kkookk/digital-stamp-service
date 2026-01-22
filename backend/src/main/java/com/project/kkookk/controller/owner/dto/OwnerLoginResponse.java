package com.project.kkookk.controller.owner.dto;

import com.project.kkookk.domain.owner.OwnerAccount;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "점주 로그인 응답")
public record OwnerLoginResponse(
        @Schema(description = "JWT 액세스 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
                String accessToken,
        @Schema(description = "점주 계정 ID", example = "1") Long id,
        @Schema(description = "이메일", example = "owner@example.com") String email,
        @Schema(description = "로그인 ID", example = "owner123") String loginId,
        @Schema(description = "이름", example = "홍길동") String name,
        @Schema(description = "전화번호", example = "010-1234-5678") String phoneNumber) {

    public static OwnerLoginResponse of(String accessToken, OwnerAccount ownerAccount) {
        return new OwnerLoginResponse(
                accessToken,
                ownerAccount.getId(),
                ownerAccount.getEmail(),
                ownerAccount.getLoginId(),
                ownerAccount.getName(),
                ownerAccount.getPhoneNumber());
    }
}
