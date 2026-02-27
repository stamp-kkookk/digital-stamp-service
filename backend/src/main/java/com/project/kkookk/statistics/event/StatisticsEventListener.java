package com.project.kkookk.statistics.event;

import com.project.kkookk.global.config.CacheConfig;
import com.project.kkookk.global.event.DomainEvent;
import com.project.kkookk.issuance.event.StampIssuedEvent;
import com.project.kkookk.migration.event.StampMigratedEvent;
import com.project.kkookk.redeem.event.RewardRedeemedEvent;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class StatisticsEventListener {

    private final CacheManager cacheManager;
    private final MeterRegistry meterRegistry;

    @Async("eventTaskExecutor")
    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2))
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStampIssued(StampIssuedEvent event) {
        evictStoreSummaryCache(event.storeId());
        meterRegistry
                .counter("stamp.issued", "storeId", String.valueOf(event.storeId()))
                .increment();
        log.info("[Statistics] Cache evicted for storeId={} after stamp issuance", event.storeId());
    }

    @Async("eventTaskExecutor")
    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2))
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStampMigrated(StampMigratedEvent event) {
        evictStoreSummaryCache(event.storeId());
        meterRegistry
                .counter("stamp.migrated", "storeId", String.valueOf(event.storeId()))
                .increment();
        log.info(
                "[Statistics] Cache evicted for storeId={} after stamp migration", event.storeId());
    }

    @Async("eventTaskExecutor")
    @Retryable(
            retryFor = Exception.class,
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000, multiplier = 2))
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRewardRedeemed(RewardRedeemedEvent event) {
        evictStoreSummaryCache(event.storeId());
        meterRegistry
                .counter("reward.redeemed", "storeId", String.valueOf(event.storeId()))
                .increment();
        log.info(
                "[Statistics] Cache evicted for storeId={} after reward redemption",
                event.storeId());
    }

    @Recover
    public void recover(Exception e, DomainEvent event) {
        meterRegistry
                .counter("event.listener.failure", "eventType", event.getClass().getSimpleName())
                .increment();
        log.error("[Event] Retry exhausted: {}", event.eventId(), e);
    }

    private void evictStoreSummaryCache(Long storeId) {
        var cache = cacheManager.getCache(CacheConfig.STORE_SUMMARY_CACHE);
        if (cache != null) {
            cache.evict(storeId);
        }
    }
}
