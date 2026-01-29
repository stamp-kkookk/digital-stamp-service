package com.project.kkookk.otp.service.sms;

public interface SmsProvider {

    /**
     * OTP 코드를 SMS로 발송합니다.
     *
     * @param phone 전화번호 (010-1234-5678 형식)
     * @param otpCode 6자리 OTP 코드
     */
    void sendOtp(String phone, String otpCode);
}
