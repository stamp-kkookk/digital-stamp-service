package com.project.kkookk.global.health;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OtpStoreHealthIndicator implements HealthIndicator {

    private static final int WARNING_THRESHOLD = 10_000;
    private static final int DOWN_THRESHOLD = 50_000;

    private final OtpStoreAccessor otpStoreAccessor;

    @Override
    public Health health() {
        int otpSize = otpStoreAccessor.getOtpStoreSize();
        int rateLimitSize = otpStoreAccessor.getRateLimitStoreSize();
        int totalSize = otpSize + rateLimitSize;

        Health.Builder builder =
                totalSize >= DOWN_THRESHOLD
                        ? Health.down()
                        : totalSize >= WARNING_THRESHOLD ? Health.status("WARNING") : Health.up();

        return builder.withDetail("otpStoreSize", otpSize)
                .withDetail("rateLimitStoreSize", rateLimitSize)
                .withDetail("totalSize", totalSize)
                .withDetail("warningThreshold", WARNING_THRESHOLD)
                .withDetail("downThreshold", DOWN_THRESHOLD)
                .build();
    }
}
