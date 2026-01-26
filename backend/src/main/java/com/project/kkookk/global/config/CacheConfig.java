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

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(STORE_SUMMARY_CACHE);
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
}
