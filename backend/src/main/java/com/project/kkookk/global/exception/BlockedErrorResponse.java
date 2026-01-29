package com.project.kkookk.global.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Duration;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BlockedErrorResponse(
        String code,
        String message,
        LocalDateTime timestamp,
        Long blockedDurationSeconds,
        Integer failureCount) {
    public static BlockedErrorResponse of(
            ErrorCode errorCode, Duration blockedDuration, int failureCount) {
        return new BlockedErrorResponse(
                errorCode.getCode(),
                errorCode.getMessage(),
                LocalDateTime.now(),
                blockedDuration != null ? blockedDuration.toSeconds() : null,
                failureCount);
    }
}
