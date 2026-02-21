package com.project.kkookk.oauth.config;

import com.project.kkookk.oauth.controller.dto.OAuthLoginResponse;
import com.project.kkookk.oauth.domain.OAuthProvider;
import com.project.kkookk.oauth.service.OAuthExchangeCodeStore;
import com.project.kkookk.oauth.service.OAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final OAuthService oauthService;
    private final OAuthExchangeCodeStore exchangeCodeStore;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = authToken.getPrincipal();
        String registrationId = authToken.getAuthorizedClientRegistrationId();

        // Extract user info based on provider
        OAuthProvider provider = OAuthProvider.valueOf(registrationId.toUpperCase());
        Map<String, Object> attributes = oauth2User.getAttributes();

        String providerId = extractProviderId(attributes, registrationId);
        String name = extractName(attributes, registrationId);
        String email = extractEmail(attributes, registrationId);

        // Read role and storeId from cookies
        String role =
                cookieRepository
                        .readCookie(
                                request,
                                HttpCookieOAuth2AuthorizationRequestRepository.OAUTH2_ROLE_COOKIE)
                        .orElse("CUSTOMER");
        Long storeId =
                cookieRepository
                        .readCookie(
                                request,
                                HttpCookieOAuth2AuthorizationRequestRepository
                                        .OAUTH2_STORE_ID_COOKIE)
                        .filter(s -> !s.isBlank())
                        .map(Long::valueOf)
                        .orElse(null);

        // Clean up cookies
        cookieRepository.removeAdditionalCookies(response);

        try {
            OAuthLoginResponse loginResponse =
                    oauthService.processOAuth2Login(
                            provider, providerId, name, email, role, storeId);

            String exchangeCode = exchangeCodeStore.store(loginResponse);

            String redirectUrl = frontendUrl + "/oauth/complete?code=" + exchangeCode;
            if (storeId != null) {
                redirectUrl += "&storeId=" + storeId;
            }
            redirectUrl += "&role=" + URLEncoder.encode(role, StandardCharsets.UTF_8);

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            log.error("[OAuth2 Success Handler] Error processing login", e);
            String errorUrl =
                    frontendUrl
                            + "/oauth/complete?error="
                            + URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }

    private String extractProviderId(Map<String, Object> attributes, String registrationId) {
        return switch (registrationId) {
            case "google" -> (String) attributes.get("sub");
            case "kakao" -> String.valueOf(attributes.get("id"));
            case "naver" -> (String) attributes.get("id");
            default ->
                    throw new IllegalArgumentException("Unsupported provider: " + registrationId);
        };
    }

    @SuppressWarnings("unchecked")
    private String extractName(Map<String, Object> attributes, String registrationId) {
        return switch (registrationId) {
            case "google" -> (String) attributes.get("name");
            case "kakao" -> {
                Object props = attributes.get("properties");
                if (props instanceof Map) {
                    yield (String) ((Map<String, Object>) props).get("nickname");
                }
                yield null;
            }
            case "naver" -> (String) attributes.get("name");
            default -> null;
        };
    }

    private String extractEmail(Map<String, Object> attributes, String registrationId) {
        return switch (registrationId) {
            case "google" -> (String) attributes.get("email");
            case "kakao" -> null;
            case "naver" -> (String) attributes.get("email");
            default -> null;
        };
    }
}
