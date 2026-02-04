package com.project.kkookk.global.util;

import com.project.kkookk.global.config.JwtProperties;
import com.project.kkookk.global.security.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_STORE_ID = "storeId";

    private final JwtProperties jwtProperties;

    /**
     * Owner 백오피스용 토큰 생성
     */
    public String generateOwnerToken(Long ownerId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TokenType.OWNER.name());
        claims.put(CLAIM_EMAIL, email);

        return generateToken(ownerId, claims, jwtProperties.getAccessTokenExpiration());
    }

    /**
     * Terminal 매장단말용 토큰 생성
     */
    public String generateTerminalToken(Long ownerId, String email, Long storeId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TokenType.TERMINAL.name());
        claims.put(CLAIM_EMAIL, email);
        claims.put(CLAIM_STORE_ID, storeId);

        return generateToken(ownerId, claims, jwtProperties.getAccessTokenExpiration());
    }

    /**
     * Customer 일반 토큰 생성 (지갑 등록/조회용)
     */
    public String generateCustomerToken(Long walletId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TokenType.CUSTOMER.name());

        return generateToken(walletId, claims, jwtProperties.getAccessTokenExpiration());
    }

    /**
     * Customer StepUp 토큰 생성 (OTP 인증 후 민감 기능용)
     */
    public String generateStepUpToken(Long walletId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TokenType.STEPUP.name());

        return generateToken(walletId, claims, jwtProperties.getStepupTokenExpiration());
    }

    /**
     * 공통 토큰 생성 메서드
     */
    private String generateToken(Long subjectId, Map<String, Object> claims, long expiration) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(String.valueOf(subjectId))
                .claims(claims)
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 토큰에서 타입 추출
     */
    public TokenType getTokenType(String token) {
        Claims claims = parseToken(token);
        String type = claims.get(CLAIM_TYPE, String.class);
        if (type == null) {
            return null;
        }
        return TokenType.valueOf(type);
    }

    /**
     * 토큰에서 Subject ID 추출
     */
    public Long getSubjectId(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 토큰에서 이메일 추출 (Owner, Terminal용)
     */
    public String getEmail(String token) {
        Claims claims = parseToken(token);
        return claims.get(CLAIM_EMAIL, String.class);
    }

    /**
     * 토큰에서 매장 ID 추출 (Terminal용)
     */
    public Long getStoreId(String token) {
        Claims claims = parseToken(token);
        return claims.get(CLAIM_STORE_ID, Long.class);
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ========== 하위 호환용 메서드 (Deprecated) ==========

    /**
     * @deprecated Use {@link #generateOwnerToken(Long, String)} instead
     */
    @Deprecated
    public String generateAccessToken(Long ownerId, String email) {
        return generateOwnerToken(ownerId, email);
    }

    /**
     * @deprecated Use {@link #generateCustomerToken(Long)} instead
     */
    @Deprecated
    public String generateCustomerAccessToken(Long walletId, String phone) {
        return generateCustomerToken(walletId);
    }

    /**
     * @deprecated Use {@link #getSubjectId(String)} instead
     */
    @Deprecated
    public Long getOwnerIdFromToken(String token) {
        return getSubjectId(token);
    }
}
