package com.project.kkookk.terminal.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "터미널 로그인 요청 DTO")
public record TerminalLoginRequest(
        @Schema(description = "이메일", example = "owner@example.com")
                @NotBlank(message = "이메일은 필수입니다")
                @Email(message = "올바른 이메일 형식이 아닙니다")
                String email,
        @Schema(description = "비밀번호", example = "password123") @NotBlank(message = "비밀번호는 필수입니다")
                String password,
        @Schema(description = "매장 ID", example = "1") @NotNull(message = "매장 ID는 필수입니다")
                Long storeId) {}
