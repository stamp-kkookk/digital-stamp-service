package com.project.kkookk.oauth.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record CompleteOwnerSignupRequest(
        @NotBlank String tempToken,
        @NotBlank String name,
        String nickname,
        @NotBlank String phone) {}
