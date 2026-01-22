package com.project.kkookk.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TerminalLoginRequest(
    @Schema(description = "점주 이메일", example = "owner@example.com")
    @NotBlank
    @Email
    String email,

    @Schema(description = "비밀번호", example = "password1234")
    @NotBlank
    String password
) {}
