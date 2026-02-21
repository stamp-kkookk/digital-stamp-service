package com.project.kkookk.oauth.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "oauth")
public class OAuthProperties {

    private final ProviderConfig google;
    private final ProviderConfig kakao;
    private final ProviderConfig naver;

    @Getter
    @RequiredArgsConstructor
    public static class ProviderConfig {
        private final String clientId;
        private final String clientSecret;
    }
}
