package com.project.kkookk.oauth.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.project.kkookk.oauth.controller.dto.OAuthLoginResponse;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class OAuthExchangeCodeStore {

    private final Cache<String, OAuthLoginResponse> cache =
            Caffeine.newBuilder()
                    .expireAfterWrite(Duration.ofSeconds(60))
                    .maximumSize(1000)
                    .build();

    public String store(OAuthLoginResponse response) {
        String code = UUID.randomUUID().toString();
        cache.put(code, response);
        return code;
    }

    public Optional<OAuthLoginResponse> exchange(String code) {
        OAuthLoginResponse response = cache.getIfPresent(code);
        if (response != null) {
            cache.invalidate(code);
            return Optional.of(response);
        }
        return Optional.empty();
    }
}
