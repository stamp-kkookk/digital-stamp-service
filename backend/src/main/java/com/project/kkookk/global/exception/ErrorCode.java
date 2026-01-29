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
    FILE_STORAGE_ERROR(
            HttpStatus.INTERNAL_SERVER_ERROR, "FILE_STORAGE_ERROR", "파일 저장 중 오류가 발생했습니다"),
    QR_GENERATION_FAILED(
            HttpStatus.INTERNAL_SERVER_ERROR, "QR_GENERATION_FAILED", "QR 코드 생성 중 오류가 발생했습니다"),

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
            HttpStatus.BAD_REQUEST, "STAMP_CARD_UPDATE_NOT_ALLOWED", "활성 상태에서는 일부 필드만 수정할 수 있습니다"),

    // Store
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "STORE_NOT_FOUND", "매장을 찾을 수 없습니다"),
    STORE_INACTIVE(HttpStatus.BAD_REQUEST, "STORE_INACTIVE", "비활성화된 매장입니다"),

    // Terminal
    TERMINAL_ACCESS_DENIED(HttpStatus.FORBIDDEN, "TERMINAL_ACCESS_DENIED", "단말기 접근 권한이 없습니다"),

    // Issuance
    ISSUANCE_REQUEST_NOT_FOUND(
            HttpStatus.NOT_FOUND, "ISSUANCE_REQUEST_NOT_FOUND", "발급 요청을 찾을 수 없습니다"),
    ISSUANCE_REQUEST_NOT_PENDING(
            HttpStatus.BAD_REQUEST, "ISSUANCE_REQUEST_NOT_PENDING", "처리 대기 중인 요청이 아닙니다"),

    // OTP
    OTP_RATE_LIMIT_EXCEEDED(
            HttpStatus.TOO_MANY_REQUESTS, "OTP_001", "OTP 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요."),
    OTP_SEND_FAILED(HttpStatus.SERVICE_UNAVAILABLE, "OTP_002", "OTP 발송에 실패했습니다."),
    OTP_EXPIRED(HttpStatus.BAD_REQUEST, "OTP_003", "OTP가 만료되었습니다."),
    OTP_NOT_FOUND(HttpStatus.NOT_FOUND, "OTP_005", "OTP 세션을 찾을 수 없습니다."),
    OTP_INVALID(HttpStatus.BAD_REQUEST, "OTP_006", "잘못된 OTP 코드입니다."),

    // Wallet
    WALLET_PHONE_DUPLICATED(HttpStatus.CONFLICT, "WALLET_001", "이미 등록된 전화번호입니다."),
    OTP_VERIFICATION_FAILED(HttpStatus.BAD_REQUEST, "WALLET_002", "OTP 검증에 실패했습니다."),
    WALLET_NOT_FOUND(HttpStatus.NOT_FOUND, "WALLET_NOT_FOUND", "지갑 정보를 찾을 수 없습니다"),

    // Failure Limit
    FAILURE_LIMIT_EXCEEDED(
            HttpStatus.TOO_MANY_REQUESTS, "FAILURE_LIMIT_001", "시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요."),
    ACCOUNT_BLOCKED(
            HttpStatus.TOO_MANY_REQUESTS,
            "FAILURE_LIMIT_002",
            "계정이 일시적으로 차단되었습니다. {0} 후에 다시 시도해주세요.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
