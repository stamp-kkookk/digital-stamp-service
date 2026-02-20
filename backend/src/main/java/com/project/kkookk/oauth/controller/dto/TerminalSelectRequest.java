package com.project.kkookk.oauth.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TerminalSelectRequest(@NotBlank String tempToken, @NotNull Long storeId) {}
