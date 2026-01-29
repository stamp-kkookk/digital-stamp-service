package com.project.kkookk.common.limit.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "app.security.failure-limit")
@Validated
public class FailureLimitProperties {

    /**
     * 최대 실패 횟수
     */
    private int maxAttempts = 5;

    /**
     * 실패 횟수 도달 시 차단 기간
     */
    private Duration cooldownPeriod = Duration.ofMinutes(10);

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public Duration getCooldownPeriod() {
        return cooldownPeriod;
    }

    public void setCooldownPeriod(Duration cooldownPeriod) {
        this.cooldownPeriod = cooldownPeriod;
    }
}
