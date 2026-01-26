package com.project.kkookk.global.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String code, String message, LocalDateTime timestamp, List<FieldError> errors) {

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(
                errorCode.getCode(), errorCode.getMessage(), LocalDateTime.now(), null);
    }

    public static ErrorResponse of(ErrorCode errorCode, String message) {
        return new ErrorResponse(errorCode.getCode(), message, LocalDateTime.now(), null);
    }

    public static ErrorResponse of(ErrorCode errorCode, List<FieldError> errors) {
        return new ErrorResponse(
                errorCode.getCode(), errorCode.getMessage(), LocalDateTime.now(), errors);
    }

    public record FieldError(String field, String message) {}
}
