package com.project.kkookk.owner.controller.dto;

import com.project.kkookk.owner.domain.OwnerAccount;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "점주 회원가입 응답")
public record OwnerSignupResponse(
        @Schema(description = "점주 계정 ID", example = "1") Long id,
        @Schema(description = "이메일", example = "owner@example.com") String email,
        @Schema(description = "이름", example = "홍길동") String name,
        @Schema(description = "전화번호", example = "010-1234-5678") String phoneNumber,
        @Schema(description = "생성 시각", example = "2024-01-15T10:30:00") LocalDateTime createdAt) {

    public static OwnerSignupResponse from(OwnerAccount ownerAccount) {
        return new OwnerSignupResponse(
                ownerAccount.getId(),
                ownerAccount.getEmail(),
                ownerAccount.getName(),
                ownerAccount.getPhoneNumber(),
                ownerAccount.getCreatedAt());
    }
}
