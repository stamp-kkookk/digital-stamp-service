package com.project.kkookk.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 404 NOT_FOUND
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "매장을 찾을 수 없습니다."),
    STORE_INACTIVE(HttpStatus.NOT_FOUND, "현재 운영 중인 매장이 아닙니다."),

    // Terminal & Issuance Errors
    TERMINAL_ACCESS_DENIED("T001", "해당 가게에 대한 단말기 접근 권한이 없습니다.", HttpStatus.FORBIDDEN),
    ISSUANCE_REQUEST_NOT_FOUND("T002", "존재하지 않는 발급 요청입니다.", HttpStatus.NOT_FOUND),
    ISSUANCE_REQUEST_NOT_PENDING("T003", "이미 처리되었거나 만료된 요청입니다.", HttpStatus.CONFLICT),

    // 500 INTERNAL_SERVER_ERROR
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 오류가 발생했습니다."),
    QR_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "QR 코드 생성에 실패했습니다."),
    FILE_STORAGE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장소 처리 중 오류가 발생했습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
