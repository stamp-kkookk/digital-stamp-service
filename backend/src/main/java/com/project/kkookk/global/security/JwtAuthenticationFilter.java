package com.project.kkookk.global.security;

import com.project.kkookk.global.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String token = extractTokenFromRequest(request);

            if (token != null && jwtUtil.validateToken(token)) {
                authenticateUser(token, request);
            }
        } catch (Exception e) {
            log.error("JWT authentication failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }

    private void authenticateUser(String token, HttpServletRequest request) {
        Claims claims = jwtUtil.parseToken(token);
        Long subjectId = Long.parseLong(claims.getSubject());

        // email 클레임이 있으면 Owner, phone 클레임이 있으면 Customer
        String email = claims.get("email", String.class);
        String phone = claims.get("phone", String.class);

        UsernamePasswordAuthenticationToken authentication;

        if (email != null) {
            // Owner 인증
            OwnerPrincipal principal = OwnerPrincipal.of(subjectId, email);
            authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal, null, principal.getAuthorities());
        } else if (phone != null) {
            // Customer 인증
            CustomerPrincipal principal = CustomerPrincipal.of(subjectId, phone);
            authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal, null, principal.getAuthorities());
        } else {
            log.warn("JWT token has neither email nor phone claim");
            return;
        }

        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
