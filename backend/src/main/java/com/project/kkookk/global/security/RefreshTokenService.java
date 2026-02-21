package com.project.kkookk.global.security;

import com.project.kkookk.global.config.JwtProperties;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;

    /** Owner용 RefreshToken 발급 */
    @Transactional
    public String issueOwnerRefreshToken(Long ownerId, String email, boolean isAdmin) {
        String token = jwtUtil.generateRefreshToken();
        String tokenHash = jwtUtil.hashToken(token);

        LocalDateTime expiresAt =
                LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000);

        RefreshToken refreshToken =
                RefreshToken.builder()
                        .tokenHash(tokenHash)
                        .tokenType(TokenType.OWNER)
                        .subjectId(ownerId)
                        .email(email)
                        .isAdmin(isAdmin)
                        .expiresAt(expiresAt)
                        .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    /** Customer용 RefreshToken 발급 */
    @Transactional
    public String issueCustomerRefreshToken(Long walletId) {
        String token = jwtUtil.generateRefreshToken();
        String tokenHash = jwtUtil.hashToken(token);

        LocalDateTime expiresAt =
                LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenExpiration() / 1000);

        RefreshToken refreshToken =
                RefreshToken.builder()
                        .tokenHash(tokenHash)
                        .tokenType(TokenType.CUSTOMER)
                        .subjectId(walletId)
                        .expiresAt(expiresAt)
                        .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    /** RefreshToken 검증 및 엔티티 조회 */
    public RefreshToken validateRefreshToken(String token) {
        String tokenHash = jwtUtil.hashToken(token);

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByTokenHash(tokenHash)
                        .orElseThrow(() -> new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID));

        if (refreshToken.isRevoked()) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        if (refreshToken.isExpired()) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        return refreshToken;
    }

    /** 단일 토큰 무효화 (Rotation용) */
    @Transactional
    public void revokeToken(RefreshToken refreshToken) {
        refreshToken.revoke();
    }

    /** 사용자의 모든 토큰 무효화 (로그아웃용) */
    @Transactional
    public void revokeAllUserTokens(TokenType tokenType, Long subjectId) {
        refreshTokenRepository.revokeAllByTokenTypeAndSubjectId(tokenType, subjectId);
    }

    /** 만료된 토큰 정리 (매일 오전 3시 실행) */
    @Transactional
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        refreshTokenRepository.deleteExpiredTokens(now);
        log.info("Expired refresh tokens cleaned up at {}", now);
    }
}
