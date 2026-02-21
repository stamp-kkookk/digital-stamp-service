package com.project.kkookk.oauth.controller;

import com.project.kkookk.oauth.controller.dto.CompleteCustomerSignupRequest;
import com.project.kkookk.oauth.controller.dto.CompleteOwnerSignupRequest;
import com.project.kkookk.oauth.controller.dto.OAuthLoginRequest;
import com.project.kkookk.oauth.controller.dto.OAuthLoginResponse;
import com.project.kkookk.oauth.service.OAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/oauth")
@RequiredArgsConstructor
public class OAuthController {

    private final OAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<OAuthLoginResponse> login(@Valid @RequestBody OAuthLoginRequest request) {
        OAuthLoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete-customer-signup")
    public ResponseEntity<OAuthLoginResponse> completeCustomerSignup(
            @Valid @RequestBody CompleteCustomerSignupRequest request) {
        OAuthLoginResponse response = authService.completeCustomerSignup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete-owner-signup")
    public ResponseEntity<OAuthLoginResponse> completeOwnerSignup(
            @Valid @RequestBody CompleteOwnerSignupRequest request) {
        OAuthLoginResponse response = authService.completeOwnerSignup(request);
        return ResponseEntity.ok(response);
    }
}
