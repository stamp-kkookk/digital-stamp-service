package com.project.kkookk.otp.domain;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OtpSessionData implements Serializable {

    private String phone; // 전화번호 (010-1234-5678)
    private String otpCode; // 6자리 OTP
    private String verificationId; // UUID (클라이언트 추적용)
    private OtpSessionStatus status; // 세션 상태
    private LocalDateTime expiresAt; // 만료 시각 (생성 시각 + 3분)
    private int attemptCount; // 검증 시도 횟수 (0~5)
    private LocalDateTime createdAt; // 생성 시각

    /** PENDING 상태 확인 */
    public boolean isPending() {
        return status == OtpSessionStatus.PENDING;
    }

    /** 만료 여부 확인 */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /** 검증 가능 여부 (PENDING + 미만료 + 시도 횟수 미초과) */
    public boolean canAttempt() {
        return isPending() && !isExpired() && attemptCount < 5;
    }

    /** 시도 횟수 증가 + 5회 초과 시 EXHAUSTED 처리 */
    public void incrementAttempt() {
        attemptCount++;
        if (attemptCount >= 5) {
            status = OtpSessionStatus.EXHAUSTED;
        }
    }

    /** 검증 완료 처리 */
    public void verify() {
        status = OtpSessionStatus.VERIFIED;
    }
}
