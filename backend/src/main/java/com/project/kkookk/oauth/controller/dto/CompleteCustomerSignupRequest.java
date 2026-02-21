package com.project.kkookk.oauth.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record CompleteCustomerSignupRequest(
        @NotBlank String tempToken,
        @NotBlank String name,
        @NotBlank String nickname,
        @NotBlank String phone,
        Long storeId) {}
