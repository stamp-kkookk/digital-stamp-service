package com.project.kkookk.global.security;

import com.project.kkookk.global.security.dto.TokenRefreshRequest;
import com.project.kkookk.global.security.dto.TokenRefreshResponse;
import com.project.kkookk.global.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth", description = "인증 API")
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class TokenRefreshController {

    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "토큰 갱신",
            description = "RefreshToken을 사용하여 새로운 AccessToken과 RefreshToken을 발급합니다")
    @PostMapping("/refresh")
    @Transactional
    public TokenRefreshResponse refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        // 1. RefreshToken 검증
        RefreshToken refreshToken =
                refreshTokenService.validateRefreshToken(request.refreshToken());

        // 2. TokenType에 따라 새 AccessToken 생성
        String newAccessToken = generateAccessToken(refreshToken);

        // 3. 기존 RefreshToken 무효화 (Rotation)
        refreshTokenService.revokeToken(refreshToken);

        // 4. 새 RefreshToken 발급
        String newRefreshToken = issueNewRefreshToken(refreshToken);

        log.info(
                "[Token Refresh] type={}, subjectId={}",
                refreshToken.getTokenType(),
                refreshToken.getSubjectId());

        return new TokenRefreshResponse(newAccessToken, newRefreshToken);
    }

    private String generateAccessToken(RefreshToken refreshToken) {
        return switch (refreshToken.getTokenType()) {
            case OWNER ->
                    jwtUtil.generateOwnerToken(
                            refreshToken.getSubjectId(),
                            refreshToken.getEmail(),
                            refreshToken.getIsAdmin() != null && refreshToken.getIsAdmin());
            case TERMINAL ->
                    jwtUtil.generateTerminalToken(
                            refreshToken.getSubjectId(),
                            refreshToken.getEmail(),
                            refreshToken.getStoreId());
            case CUSTOMER -> jwtUtil.generateCustomerToken(refreshToken.getSubjectId());
            case STEPUP -> throw new IllegalStateException("STEPUP 토큰은 RefreshToken을 지원하지 않습니다");
        };
    }

    private String issueNewRefreshToken(RefreshToken oldToken) {
        return switch (oldToken.getTokenType()) {
            case OWNER ->
                    refreshTokenService.issueOwnerRefreshToken(
                            oldToken.getSubjectId(),
                            oldToken.getEmail(),
                            oldToken.getIsAdmin() != null && oldToken.getIsAdmin());
            case TERMINAL ->
                    refreshTokenService.issueTerminalRefreshToken(
                            oldToken.getSubjectId(), oldToken.getEmail(), oldToken.getStoreId());
            case CUSTOMER -> refreshTokenService.issueCustomerRefreshToken(oldToken.getSubjectId());
            case STEPUP -> throw new IllegalStateException("STEPUP 토큰은 RefreshToken을 지원하지 않습니다");
        };
    }
}
