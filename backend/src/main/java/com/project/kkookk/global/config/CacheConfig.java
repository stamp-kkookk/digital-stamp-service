package com.project.kkookk.global.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CacheConfig {

    public static final String STORE_SUMMARY_CACHE = "storeSummary";
    public static final String OTP_SESSION_CACHE = "otpSession";
    public static final String OTP_RATE_LIMIT_CACHE = "otpRateLimit";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager =
                new CaffeineCacheManager(STORE_SUMMARY_CACHE, OTP_SESSION_CACHE, OTP_RATE_LIMIT_CACHE);
        cacheManager.registerCustomCache(OTP_SESSION_CACHE, otpSessionCacheBuilder().build());
        cacheManager.registerCustomCache(OTP_RATE_LIMIT_CACHE, otpRateLimitCacheBuilder().build());
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }

    private Caffeine<Object, Object> caffeineCacheBuilder() {
        // 매장 정보나 스탬프 카드 정책은 자주 변경되지 않으므로, 10분으로 TTL 설정
        // DB 부하를 줄이고, 사용자에게 빠른 응답성을 제공
        return Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(1000); // 최대 1000개의 매장 정보를 캐싱
    }

    private Caffeine<Object, Object> otpSessionCacheBuilder() {
        // OTP 세션: 3분 TTL (OTP 만료 시간)
        return Caffeine.newBuilder().expireAfterWrite(180, TimeUnit.SECONDS).maximumSize(10000);
    }

    private Caffeine<Object, Object> otpRateLimitCacheBuilder() {
        // Rate limit: 60초 TTL (Rate limit 윈도우)
        return Caffeine.newBuilder().expireAfterWrite(60, TimeUnit.SECONDS).maximumSize(10000);
    }
}
