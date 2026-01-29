package com.project.kkookk.common.limit.application;

import com.project.kkookk.common.limit.config.FailureLimitProperties;
import com.project.kkookk.common.limit.domain.FailureRecord;
import com.project.kkookk.common.limit.exception.BlockedException;
import com.project.kkookk.global.exception.ErrorCode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FailureLimitService {

    private final CacheManager cacheManager;
    private final FailureLimitProperties properties;

    private Cache getCache() {
        return cacheManager.getCache("failureCache");
    }

    public void checkBlocked(String identifier) {
        getFailureRecord(identifier)
                .ifPresent(
                        record -> {
                            if (record.isBlocked()) {
                                Duration remaining =
                                        Duration.between(
                                                LocalDateTime.now(), record.getBlockedUntil());
                                throw new BlockedException(
                                        ErrorCode.ACCOUNT_BLOCKED,
                                        record.getFailureCount(),
                                        remaining);
                            }
                        });
    }

    public void recordFailure(String identifier) {
        FailureRecord record =
                getFailureRecord(identifier)
                        .map(FailureRecord::incrementFailureCount)
                        .orElse(FailureRecord.initialRecord(identifier));

        if (record.getFailureCount() >= properties.getMaxAttempts()) {
            LocalDateTime blockedUntil = LocalDateTime.now().plus(properties.getCooldownPeriod());
            record = record.block(blockedUntil);
        }
        getCache().put(identifier, record);
    }

    public void recordSuccess(String identifier) {
        getCache().evict(identifier);
    }

    public int getRemainingAttempts(String identifier) {
        return getFailureRecord(identifier)
                .map(r -> properties.getMaxAttempts() - r.getFailureCount())
                .orElse(properties.getMaxAttempts());
    }

    public Optional<Duration> getBlockedDuration(String identifier) {
        return getFailureRecord(identifier)
                .filter(FailureRecord::isBlocked)
                .map(r -> Duration.between(LocalDateTime.now(), r.getBlockedUntil()));
    }

    private Optional<FailureRecord> getFailureRecord(String identifier) {
        return Optional.ofNullable(getCache().get(identifier, FailureRecord.class));
    }
}
