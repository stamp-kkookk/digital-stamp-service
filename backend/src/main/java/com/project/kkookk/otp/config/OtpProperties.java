package com.project.kkookk.otp.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "otp")
public class OtpProperties {

    private final int expirationSeconds; // 180
    private final int maxAttempts; // 5
    private final RateLimit rateLimit;
    private final Dev dev;

    @Getter
    @RequiredArgsConstructor
    public static class RateLimit {
        private final int windowSeconds; // 60
        private final int maxRequests; // 3
    }

    @Getter
    @RequiredArgsConstructor
    public static class Dev {
        private final String fixedCode; // "123456"
    }
}
