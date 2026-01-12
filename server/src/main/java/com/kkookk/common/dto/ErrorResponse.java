package com.kkookk.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ErrorResponse {
    private String code;
    private String message;
    private Object details;

    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
        this.details = null;
    }
}
