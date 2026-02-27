package com.project.kkookk.statistics.event;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.config.CacheConfig;
import com.project.kkookk.issuance.event.StampIssuedEvent;
import com.project.kkookk.migration.event.StampMigratedEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.event.RewardRedeemedEvent;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@ExtendWith(MockitoExtension.class)
class StatisticsEventListenerTest {

    @InjectMocks private StatisticsEventListener listener;
    @Mock private CacheManager cacheManager;
    @Mock private MeterRegistry meterRegistry;

    @Test
    @DisplayName("StampIssuedEvent 수신 시 캐시 무효화 및 메트릭 기록")
    void onStampIssued_evictsCacheAndRecordsMetric() {
        // given
        StampIssuedEvent event = new StampIssuedEvent(100L, 1L, 10L, 50L, 1, "현장 승인");
        Cache cache = mock(Cache.class);
        Counter counter = mock(Counter.class);
        given(cacheManager.getCache(CacheConfig.STORE_SUMMARY_CACHE)).willReturn(cache);
        given(meterRegistry.counter(eq("stamp.issued"), anyString(), anyString()))
                .willReturn(counter);

        // when
        listener.onStampIssued(event);

        // then
        verify(cache).evict(1L);
        verify(counter).increment();
    }

    @Test
    @DisplayName("StampMigratedEvent 수신 시 캐시 무효화 및 메트릭 기록")
    void onStampMigrated_evictsCacheAndRecordsMetric() {
        // given
        StampMigratedEvent event = new StampMigratedEvent(200L, 1L, 10L, 50L, 5, "종이 스탬프 전환 승인");
        Cache cache = mock(Cache.class);
        Counter counter = mock(Counter.class);
        given(cacheManager.getCache(CacheConfig.STORE_SUMMARY_CACHE)).willReturn(cache);
        given(meterRegistry.counter(eq("stamp.migrated"), anyString(), anyString()))
                .willReturn(counter);

        // when
        listener.onStampMigrated(event);

        // then
        verify(cache).evict(1L);
        verify(counter).increment();
    }

    @Test
    @DisplayName("RewardRedeemedEvent 수신 시 캐시 무효화 및 메트릭 기록")
    void onRewardRedeemed_evictsCacheAndRecordsMetric() {
        // given
        RewardRedeemedEvent event =
                new RewardRedeemedEvent(10L, 1L, 100L, RedeemEventResult.SUCCESS);
        Cache cache = mock(Cache.class);
        Counter counter = mock(Counter.class);
        given(cacheManager.getCache(CacheConfig.STORE_SUMMARY_CACHE)).willReturn(cache);
        given(meterRegistry.counter(eq("reward.redeemed"), anyString(), anyString()))
                .willReturn(counter);

        // when
        listener.onRewardRedeemed(event);

        // then
        verify(cache).evict(100L);
        verify(counter).increment();
    }

    @Test
    @DisplayName("재시도 소진 시 실패 메트릭 기록")
    void recover_recordsFailureMetric() {
        // given
        StampIssuedEvent event = new StampIssuedEvent(100L, 1L, 10L, 50L, 1, "현장 승인");
        Counter counter = mock(Counter.class);
        given(meterRegistry.counter(eq("event.listener.failure"), anyString(), anyString()))
                .willReturn(counter);

        // when
        listener.recover(new RuntimeException("test"), event);

        // then
        verify(counter).increment();
    }
}
