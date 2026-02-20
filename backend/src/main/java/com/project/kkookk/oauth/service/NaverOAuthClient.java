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
public class NaverOAuthClient implements OAuthProviderClient {

    private static final String TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
    private static final String USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

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
        params.add("client_id", oAuthProperties.getNaver().getClientId());
        params.add("client_secret", oAuthProperties.getNaver().getClientSecret());
        params.add("code", code);
        params.add("state", "STATE");

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
                    "[Naver OAuth] Code exchange failed: status={}, body={}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.OAUTH_CODE_EXCHANGE_FAILED);
        } catch (Exception e) {
            log.error("[Naver OAuth] Code exchange failed: {}", e.getMessage(), e);
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

            JsonNode responseBody = response.get("response");
            String id = responseBody.get("id").asText();
            String name = responseBody.has("name") ? responseBody.get("name").asText() : null;
            String email = responseBody.has("email") ? responseBody.get("email").asText() : null;

            return new OAuthUserInfo(id, name, email);
        } catch (Exception e) {
            log.error("[Naver OAuth] UserInfo fetch failed: {}", e.getMessage());
            throw new BusinessException(ErrorCode.OAUTH_USERINFO_FAILED);
        }
    }
}
