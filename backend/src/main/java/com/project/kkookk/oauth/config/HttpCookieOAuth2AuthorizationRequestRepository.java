package com.project.kkookk.oauth.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Arrays;
import java.util.Base64;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTH_REQUEST_COOKIE = "oauth2_auth_request";
    public static final String OAUTH2_ROLE_COOKIE = "oauth2_role";
    public static final String OAUTH2_STORE_ID_COOKIE = "oauth2_store_id";
    private static final int COOKIE_EXPIRE_SECONDS = 300;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request, OAUTH2_AUTH_REQUEST_COOKIE)
                .map(this::deserialize)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeCookies(request, response);
            return;
        }

        addCookie(response, OAUTH2_AUTH_REQUEST_COOKIE, serialize(authorizationRequest));

        String role = request.getParameter("role");
        if (role != null && !role.isBlank()) {
            addCookie(response, OAUTH2_ROLE_COOKIE, role);
        }

        String storeId = request.getParameter("storeId");
        if (storeId != null && !storeId.isBlank()) {
            addCookie(response, OAUTH2_STORE_ID_COOKIE, storeId);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request, HttpServletResponse response) {
        OAuth2AuthorizationRequest authRequest = loadAuthorizationRequest(request);
        if (authRequest != null) {
            deleteCookie(response, OAUTH2_AUTH_REQUEST_COOKIE);
        }
        return authRequest;
    }

    public void removeAdditionalCookies(HttpServletResponse response) {
        deleteCookie(response, OAUTH2_ROLE_COOKIE);
        deleteCookie(response, OAUTH2_STORE_ID_COOKIE);
    }

    private java.util.Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return java.util.Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(c -> c.getName().equals(name))
                .findFirst()
                .map(Cookie::getValue);
    }

    public java.util.Optional<String> readCookie(HttpServletRequest request, String name) {
        return getCookieValue(request, name);
    }

    private void addCookie(HttpServletResponse response, String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(COOKIE_EXPIRE_SECONDS);
        response.addCookie(cookie);
    }

    private void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private void removeCookies(HttpServletRequest request, HttpServletResponse response) {
        deleteCookie(response, OAUTH2_AUTH_REQUEST_COOKIE);
        deleteCookie(response, OAUTH2_ROLE_COOKIE);
        deleteCookie(response, OAUTH2_STORE_ID_COOKIE);
    }

    private String serialize(OAuth2AuthorizationRequest request) {
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(request);
            oos.flush();
            return Base64.getUrlEncoder().encodeToString(bos.toByteArray());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize authorization request", e);
        }
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(value);
            ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
            ObjectInputStream ois = new ObjectInputStream(bis);
            return (OAuth2AuthorizationRequest) ois.readObject();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize authorization request", e);
        }
    }
}
