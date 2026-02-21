package com.project.kkookk.oauth.controller.dto;

import com.project.kkookk.oauth.domain.OAuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OAuthLoginRequest(
        @NotNull OAuthProvider provider,
        @NotBlank String code,
        @NotBlank String redirectUri,
        @NotBlank String role,
        Long storeId) {}
