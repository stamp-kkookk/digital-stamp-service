package com.project.kkookk.otp.domain;

public enum OtpSessionStatus {
    PENDING, // 검증 대기
    VERIFIED, // 검증 완료
    EXHAUSTED // 시도 횟수 초과
}
