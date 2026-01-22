package com.project.kkookk.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "INVALID_INPUT_VALUE", "입력값이 올바르지 않습니다"),
    INTERNAL_SERVER_ERROR(
            HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다"),

    // Owner Auth
    OWNER_EMAIL_DUPLICATED(HttpStatus.CONFLICT, "OWNER_EMAIL_DUPLICATED", "이미 사용 중인 이메일입니다"),
    OWNER_LOGIN_ID_DUPLICATED(
            HttpStatus.CONFLICT, "OWNER_LOGIN_ID_DUPLICATED", "이미 사용 중인 로그인 ID입니다");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
