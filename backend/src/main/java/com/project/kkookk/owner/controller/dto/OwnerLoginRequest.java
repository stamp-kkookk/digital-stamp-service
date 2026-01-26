package com.project.kkookk.owner.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "점주 로그인 요청")
public record OwnerLoginRequest(
        @Schema(description = "이메일", example = "owner@example.com")
                @NotBlank(message = "이메일은 필수입니다")
                @Email(message = "올바른 이메일 형식이 아닙니다")
                @Size(max = 255, message = "이메일은 255자 이하여야 합니다")
                String email,
        @Schema(description = "비밀번호", example = "Password1!")
                @NotBlank(message = "비밀번호는 필수입니다")
                @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다")
                String password) {}
