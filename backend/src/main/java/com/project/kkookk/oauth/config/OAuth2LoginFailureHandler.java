package com.project.kkookk.oauth.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final HttpCookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception)
            throws IOException {

        log.error("[OAuth2 Login Failure] {}", exception.getMessage());

        cookieRepository.removeAdditionalCookies(response);

        String errorMessage =
                URLEncoder.encode("OAuth 로그인에 실패했습니다. 다시 시도해주세요.", StandardCharsets.UTF_8);
        String redirectUrl = frontendUrl + "/oauth/complete?error=" + errorMessage;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
