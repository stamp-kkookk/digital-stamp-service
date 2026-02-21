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
import org.springframework.web.client.RestClientResponseException;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleOAuthClient implements OAuthProviderClient {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    private final OAuthProperties authProperties;
    private final RestClient oauthRestClient;

    @Override
    public OAuthUserInfo getUserInfo(String code, String redirectUri) {
        String accessToken = exchangeCode(code, redirectUri);
        return fetchUserInfo(accessToken);
    }

    private String exchangeCode(String code, String redirectUri) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", authProperties.getGoogle().getClientId());
        params.add("client_secret", authProperties.getGoogle().getClientSecret());
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
        } catch (RestClientResponseException e) {
            log.error(
                    "[Google OAuth] Code exchange failed: status={}, body={}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.OAUTH_CODE_EXCHANGE_FAILED);
        } catch (Exception e) {
            log.error("[Google OAuth] Code exchange failed: {}", e.getMessage(), e);
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

            String id = response.get("sub").asText();
            String name = response.has("name") ? response.get("name").asText() : null;
            String email = response.has("email") ? response.get("email").asText() : null;

            return new OAuthUserInfo(id, name, email);
        } catch (Exception e) {
            log.error("[Google OAuth] UserInfo fetch failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.OAUTH_USERINFO_FAILED);
        }
    }
}
