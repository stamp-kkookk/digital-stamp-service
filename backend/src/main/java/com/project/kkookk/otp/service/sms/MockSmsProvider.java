package com.project.kkookk.otp.service.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("local")
public class MockSmsProvider implements SmsProvider {

    @Override
    public void sendOtp(String phone, String otpCode) {
        log.info("[DEV] OTP SMS would be sent to {} with code: {}", phone, otpCode);
        // 개발 환경에서는 실제 SMS 발송 없이 로그만 출력
    }
}
