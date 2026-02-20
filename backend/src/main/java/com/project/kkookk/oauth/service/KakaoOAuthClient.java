package com.project.kkookk.oauth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.oauth.config.OAuthProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class KakaoOAuthClient implements OAuthProviderClient {

    private static final String TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String USERINFO_URL = "https://kapi.kakao.com/v2/user/me";

    private final OAuthProperties oAuthProperties;
    private final RestClient oauthRestClient;

    @Override
    public OAuthUserInfo getUserInfo(String code, String redirectUri) {
        String accessToken = exchangeCode(code, redirectUri);
        return fetchUserInfo(accessToken);
    }

    private String exchangeCode(String code, String redirectUri) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", oAuthProperties.getKakao().getClientId());
        params.add("client_secret", oAuthProperties.getKakao().getClientSecret());
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        try {
            JsonNode response =
                    oauthRestClient
                            .post()
                            .uri(TOKEN_URL)
                            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                            .body(params)
                            .retrieve()
                            .body(JsonNode.class);

            return response.get("access_token").asText();
        } catch (Exception e) {
            log.error("[Kakao OAuth] Code exchange failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.OAUTH_CODE_EXCHANGE_FAILED);
        }
    }

    private OAuthUserInfo fetchUserInfo(String accessToken) {
        try {
            JsonNode response =
                    oauthRestClient
                            .get()
                            .uri(USERINFO_URL)
                            .header("Authorization", "Bearer " + accessToken)
                            .retrieve()
                            .body(JsonNode.class);

            String id = response.get("id").asText();

            String name = null;
            JsonNode properties = response.get("properties");
            if (properties != null && properties.has("nickname")) {
                name = properties.get("nickname").asText();
            }

            // Kakao doesn't provide email without app review
            return new OAuthUserInfo(id, name, null);
        } catch (Exception e) {
            log.error("[Kakao OAuth] UserInfo fetch failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.OAUTH_USERINFO_FAILED);
        }
    }
}
