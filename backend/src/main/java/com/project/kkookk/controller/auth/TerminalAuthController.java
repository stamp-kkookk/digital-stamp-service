package com.project.kkookk.controller.auth;

import com.project.kkookk.dto.auth.TerminalLoginRequest;
import com.project.kkookk.dto.auth.TerminalLoginResponse;
import com.project.kkookk.service.auth.TerminalAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Terminal Auth API", description = "단말기 인증 API")
@RestController
@RequestMapping("/api/v1/terminal")
@RequiredArgsConstructor
public class TerminalAuthController {

    private final TerminalAuthService terminalAuthService;

    @Operation(summary = "단말기 로그인", description = "점주 계정으로 로그인하여 단말기용 토큰을 발급받습니다.")
    @PostMapping("/login")
    public ResponseEntity<TerminalLoginResponse> login(@Valid @RequestBody TerminalLoginRequest request) {
        TerminalLoginResponse response = terminalAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
