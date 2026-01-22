package com.project.kkookk.global.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {

    private final Key key;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;

    public JwtProvider(
        @Value("${jwt.secret:secret-key-must-be-at-least-32-chars-long-1234567890}") String secret,
        @Value("${jwt.access-token-validity:3600000}") long accessTokenValidityInMilliseconds,
        @Value("${jwt.refresh-token-validity:86400000}") long refreshTokenValidityInMilliseconds
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenValidityInMilliseconds = accessTokenValidityInMilliseconds;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInMilliseconds;
    }

    public String createAccessToken(Long userId, String role, Long storeId) {
        return createToken(userId, role, storeId, accessTokenValidityInMilliseconds);
    }

    public String createRefreshToken(Long userId) {
        return createToken(userId, null, null, refreshTokenValidityInMilliseconds);
    }

    private String createToken(Long userId, String role, Long storeId, long validity) {
        Claims claims = Jwts.claims().setSubject(userId.toString());
        if (role != null) {
            claims.put("role", role);
        }
        if (storeId != null) {
            claims.put("storeId", storeId);
        }

        Date now = new Date();
        Date validityDate = new Date(now.getTime() + validity);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validityDate)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    // MVP: 검증 로직은 추후 필터 구현 시 추가
}
