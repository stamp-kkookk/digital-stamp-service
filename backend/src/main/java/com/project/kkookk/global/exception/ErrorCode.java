package com.project.kkookk.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
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
    STORE_INACTIVE(HttpStatus.FORBIDDEN, "STORE_INACTIVE", "해당 매장은 현재 이용할 수 없습니다"),
    STORE_STATUS_TRANSITION_INVALID(
            HttpStatus.BAD_REQUEST, "STORE_STATUS_TRANSITION_INVALID", "유효하지 않은 매장 상태 전이입니다"),
    STORE_PLACE_REF_DUPLICATED(HttpStatus.CONFLICT, "STORE_PLACE_REF_DUPLICATED", "이미 등록된 장소입니다"),
    STORE_ICON_TOO_LARGE(
            HttpStatus.PAYLOAD_TOO_LARGE, "STORE_ICON_TOO_LARGE", "아이콘 이미지 크기가 너무 큽니다 (최대 5MB)"),
    STORE_PHONE_INVALID(HttpStatus.BAD_REQUEST, "STORE_PHONE_INVALID", "전화번호 형식이 올바르지 않습니다"),
    STORE_NOT_OPERATIONAL(HttpStatus.BAD_REQUEST, "STORE_NOT_OPERATIONAL", "운영 중인 매장이 아닙니다"),

    // Admin
    ADMIN_ACCESS_DENIED(HttpStatus.FORBIDDEN, "ADMIN_ACCESS_DENIED", "관리자 권한이 필요합니다"),

    // Kakao
    KAKAO_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "KAKAO_API_ERROR", "카카오 API 호출 중 오류가 발생했습니다"),

    // Terminal
    TERMINAL_ACCESS_DENIED(HttpStatus.FORBIDDEN, "TERMINAL_ACCESS_DENIED", "단말기 접근 권한이 없습니다"),

    // Issuance
    ISSUANCE_REQUEST_NOT_FOUND(
            HttpStatus.NOT_FOUND, "ISSUANCE_REQUEST_NOT_FOUND", "적립 요청을 찾을 수 없습니다"),
    ISSUANCE_REQUEST_NOT_PENDING(
            HttpStatus.BAD_REQUEST, "ISSUANCE_REQUEST_NOT_PENDING", "처리 대기 중인 요청이 아닙니다"),

    // OTP
    OTP_RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "OTP_001", "OTP 요청 제한을 초과했습니다"),
    OTP_EXPIRED(HttpStatus.UNAUTHORIZED, "OTP_002", "OTP가 만료되었습니다"),
    OTP_INVALID(HttpStatus.UNAUTHORIZED, "OTP_003", "OTP가 일치하지 않습니다"),
    OTP_ATTEMPTS_EXCEEDED(HttpStatus.UNAUTHORIZED, "OTP_004", "OTP 시도 횟수를 초과했습니다"),

    // Wallet
    WALLET_PHONE_DUPLICATED(HttpStatus.CONFLICT, "WALLET_001", "이미 등록된 전화번호입니다"),
    WALLET_NICKNAME_DUPLICATED(HttpStatus.CONFLICT, "WALLET_002", "이미 사용 중인 닉네임입니다"),

    // Customer Wallet
    CUSTOMER_WALLET_NOT_FOUND(
            HttpStatus.NOT_FOUND, "CUSTOMER_WALLET_NOT_FOUND", "해당 전화번호와 이름으로 지갑을 찾을 수 없습니다"),
    CUSTOMER_WALLET_BLOCKED(HttpStatus.FORBIDDEN, "CUSTOMER_WALLET_BLOCKED", "차단된 지갑입니다"),
    WALLET_STAMP_CARD_NOT_FOUND(
            HttpStatus.NOT_FOUND, "WALLET_STAMP_CARD_NOT_FOUND", "해당 지갑 스탬프카드를 찾을 수 없습니다"),
    WALLET_STAMP_CARD_ACCESS_DENIED(
            HttpStatus.FORBIDDEN, "WALLET_STAMP_CARD_ACCESS_DENIED", "다른 고객의 스탬프카드에 접근할 수 없습니다"),
    ISSUANCE_REQUEST_ALREADY_PENDING(
            HttpStatus.CONFLICT, "ISSUANCE_REQUEST_ALREADY_PENDING", "이미 대기 중인 적립 요청이 있습니다"),
    ISSUANCE_ALREADY_PROCESSED(HttpStatus.CONFLICT, "ISSUANCE_ALREADY_PROCESSED", "이미 처리된 요청입니다"),
    ISSUANCE_REQUEST_EXPIRED(HttpStatus.GONE, "ISSUANCE_REQUEST_EXPIRED", "요청이 만료되었습니다"),

    // Redeem
    STEPUP_REQUIRED(HttpStatus.FORBIDDEN, "STEPUP_REQUIRED", "OTP 인증이 필요합니다"),
    REWARD_NOT_FOUND(HttpStatus.NOT_FOUND, "REWARD_NOT_FOUND", "리워드를 찾을 수 없습니다"),
    REWARD_NOT_AVAILABLE(HttpStatus.CONFLICT, "REWARD_NOT_AVAILABLE", "사용 가능한 리워드가 아닙니다"),
    REWARD_EXPIRED(HttpStatus.GONE, "REWARD_EXPIRED", "리워드 유효기간이 만료되었습니다"),

    // Migration
    MIGRATION_NOT_FOUND(HttpStatus.NOT_FOUND, "MIGRATION_NOT_FOUND", "마이그레이션 요청을 찾을 수 없습니다"),
    MIGRATION_ALREADY_PENDING(
            HttpStatus.CONFLICT, "MIGRATION_ALREADY_PENDING", "이미 처리 중인 마이그레이션 요청이 있습니다"),
    MIGRATION_ALREADY_PROCESSED(
            HttpStatus.CONFLICT, "MIGRATION_ALREADY_PROCESSED", "이미 처리된 마이그레이션 요청입니다"),
    MIGRATION_ACCESS_DENIED(
            HttpStatus.FORBIDDEN, "MIGRATION_ACCESS_DENIED", "다른 고객의 마이그레이션 요청에 접근할 수 없습니다"),
    MIGRATION_IMAGE_TOO_LARGE(
            HttpStatus.PAYLOAD_TOO_LARGE, "MIGRATION_IMAGE_TOO_LARGE", "이미지 크기가 너무 큽니다 (최대 5MB)"),

    // StampCard (additional)
    NO_ACTIVE_STAMP_CARD(HttpStatus.CONFLICT, "NO_ACTIVE_STAMP_CARD", "활성 스탬프 카드가 없습니다");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
