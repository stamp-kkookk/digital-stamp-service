package com.project.kkookk.global.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // Common
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "입력값이 올바르지 않습니다"),
    INTERNAL_SERVER_ERROR(
            HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "내부 서버 오류가 발생했습니다"),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "접근 권한이 없습니다"),

    // StampCard
    STAMP_CARD_NOT_FOUND(HttpStatus.NOT_FOUND, "STAMP_CARD_NOT_FOUND", "스탬프 카드를 찾을 수 없습니다"),
    STAMP_CARD_ALREADY_ACTIVE(
            HttpStatus.CONFLICT, "STAMP_CARD_ALREADY_ACTIVE", "이미 활성화된 스탬프 카드가 존재합니다"),
    STAMP_CARD_STATUS_INVALID(
            HttpStatus.BAD_REQUEST, "STAMP_CARD_STATUS_INVALID", "유효하지 않은 상태 전이입니다"),
    STAMP_CARD_DELETE_NOT_ALLOWED(
            HttpStatus.BAD_REQUEST, "STAMP_CARD_DELETE_NOT_ALLOWED", "초안 상태의 스탬프 카드만 삭제할 수 있습니다"),
    STAMP_CARD_ACCESS_DENIED(
            HttpStatus.FORBIDDEN, "STAMP_CARD_ACCESS_DENIED", "해당 스탬프 카드에 대한 접근 권한이 없습니다"),
    STAMP_CARD_UPDATE_NOT_ALLOWED(
            HttpStatus.BAD_REQUEST, "STAMP_CARD_UPDATE_NOT_ALLOWED", "활성 상태에서는 일부 필드만 수정할 수 있습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
