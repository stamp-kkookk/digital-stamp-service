package com.project.kkookk.global.security;

import com.project.kkookk.global.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
        TokenType tokenType = jwtUtil.getTokenType(token);
        if (tokenType == null) {
            log.warn("Token type is missing, rejecting authentication");
            return;
        }

        UserDetails principal = createPrincipal(token, tokenType);

        MDC.put("tokenType", tokenType.name());
        MDC.put("userId", formatUserId(tokenType, jwtUtil.getSubjectId(token)));

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities());

        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String formatUserId(TokenType tokenType, Long subjectId) {
        return switch (tokenType) {
            case OWNER -> "owner:" + subjectId;
            case TERMINAL -> "terminal:" + subjectId;
            case CUSTOMER, STEPUP -> "wallet:" + subjectId;
        };
    }

    private UserDetails createPrincipal(String token, TokenType tokenType) {
        Long subjectId = jwtUtil.getSubjectId(token);

        return switch (tokenType) {
            case OWNER -> {
                String email = jwtUtil.getEmail(token);
                boolean isAdmin = jwtUtil.getIsAdmin(token);
                yield OwnerPrincipal.of(subjectId, email, isAdmin);
            }
            case TERMINAL -> {
                String email = jwtUtil.getEmail(token);
                Long storeId = jwtUtil.getStoreId(token);
                yield TerminalPrincipal.of(subjectId, email, storeId);
            }
            case CUSTOMER -> CustomerPrincipal.of(subjectId, false);
            case STEPUP -> CustomerPrincipal.of(subjectId, true);
        };
    }
}
