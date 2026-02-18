package com.project.kkookk.wallet.controller;

import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.security.TokenType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Customer Auth", description = "고객 인증 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/auth")
public class CustomerAuthController {

    private final RefreshTokenService refreshTokenService;

    @Operation(summary = "고객 로그아웃", description = "고객 로그아웃 - 모든 RefreshToken 무효화")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal CustomerPrincipal principal) {
        refreshTokenService.revokeAllUserTokens(TokenType.CUSTOMER, principal.getWalletId());
        return ResponseEntity.noContent().build();
    }
}
