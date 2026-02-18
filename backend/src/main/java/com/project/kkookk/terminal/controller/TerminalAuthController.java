package com.project.kkookk.terminal.controller;

import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.security.TerminalPrincipal;
import com.project.kkookk.global.security.TokenType;
import com.project.kkookk.terminal.controller.dto.TerminalLoginRequest;
import com.project.kkookk.terminal.controller.dto.TerminalLoginResponse;
import com.project.kkookk.terminal.service.TerminalAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TerminalAuthController implements TerminalAuthApi {

    private final TerminalAuthService terminalAuthService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public ResponseEntity<TerminalLoginResponse> login(
            @Valid @RequestBody TerminalLoginRequest request) {
        TerminalLoginResponse response = terminalAuthService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/terminal/auth/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal TerminalPrincipal principal) {
        refreshTokenService.revokeAllUserTokens(TokenType.TERMINAL, principal.getOwnerId());
        return ResponseEntity.noContent().build();
    }
}
