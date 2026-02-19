package com.project.kkookk.global.util;

import com.project.kkookk.global.config.JwtProperties;
import com.project.kkookk.global.security.TokenType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ADMIN = "admin";

    private final JwtProperties jwtProperties;

    /** Owner 백오피스용 토큰 생성 */
    public String generateOwnerToken(Long ownerId, String email, boolean isAdmin) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TokenType.OWNER.name());
        claims.put(CLAIM_EMAIL, email);
        claims.put(CLAIM_ADMIN, isAdmin);

        return generateToken(ownerId, claims, jwtProperties.getAccessTokenExpiration());
    }

    /** Customer 일반 토큰 생성 (지갑 등록/조회용) */
    public String generateCustomerToken(Long walletId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TokenType.CUSTOMER.name());

        return generateToken(walletId, claims, jwtProperties.getAccessTokenExpiration());
    }

    /** Customer StepUp 토큰 생성 (OTP 인증 후 민감 기능용) */
    public String generateStepUpToken(Long walletId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_TYPE, TokenType.STEPUP.name());

        return generateToken(walletId, claims, jwtProperties.getStepupTokenExpiration());
    }

    /** 공통 토큰 생성 메서드 */
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

    /** 토큰에서 타입 추출 */
    public TokenType getTokenType(String token) {
        Claims claims = parseToken(token);
        String type = claims.get(CLAIM_TYPE, String.class);
        if (type == null) {
            return null;
        }
        return TokenType.valueOf(type);
    }

    /** 토큰에서 Subject ID 추출 */
    public Long getSubjectId(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /** 토큰에서 이메일 추출 (Owner용) */
    public String getEmail(String token) {
        Claims claims = parseToken(token);
        return claims.get(CLAIM_EMAIL, String.class);
    }

    /** 토큰에서 Admin 여부 추출 (Owner용) */
    public boolean getIsAdmin(String token) {
        Claims claims = parseToken(token);
        Boolean admin = claims.get(CLAIM_ADMIN, Boolean.class);
        return admin != null && admin;
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

    // ========== RefreshToken 관련 메서드 ==========

    /** RefreshToken 생성 (UUID 기반, JWT 아님) */
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    /** RefreshToken SHA-256 해싱 (DB 저장용) */
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    /** RefreshToken 만료 여부 확인 */
    public boolean isRefreshTokenExpired(LocalDateTime expiresAt) {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // ========== 하위 호환용 메서드 (Deprecated) ==========

    /**
     * @deprecated Use {@link #generateOwnerToken(Long, String, boolean)} instead
     */
    @Deprecated
    public String generateAccessToken(Long ownerId, String email) {
        return generateOwnerToken(ownerId, email, false);
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
