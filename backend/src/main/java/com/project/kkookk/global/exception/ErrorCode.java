package com.project.kkookk.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "INVALID_INPUT_VALUE", "입력값이 올바르지 않습니다"),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "입력값이 올바르지 않습니다"),
    INTERNAL_SERVER_ERROR(
            HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다"),

    // Auth
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다"),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "접근 권한이 없습니다"),
    OWNER_EMAIL_DUPLICATED(HttpStatus.CONFLICT, "OWNER_EMAIL_DUPLICATED", "이미 사용 중인 이메일입니다"),
    OWNER_LOGIN_ID_DUPLICATED(
            HttpStatus.CONFLICT, "OWNER_LOGIN_ID_DUPLICATED", "이미 사용 중인 로그인 ID입니다"),
    OWNER_LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "OWNER_LOGIN_FAILED", "이메일 또는 비밀번호가 올바르지 않습니다"),

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

    // Store
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "STORE_NOT_FOUND", "매장을 찾을 수 없습니다");


    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String code, String message) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.message = message;
    }
}
