package com.project.kkookk.oauth.controller;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.oauth.controller.dto.CompleteCustomerSignupRequest;
import com.project.kkookk.oauth.controller.dto.CompleteOwnerSignupRequest;
import com.project.kkookk.oauth.controller.dto.OAuthExchangeRequest;
import com.project.kkookk.oauth.controller.dto.OAuthLoginResponse;
import com.project.kkookk.oauth.service.OAuthExchangeCodeStore;
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
    private final OAuthExchangeCodeStore exchangeCodeStore;

    @PostMapping("/token")
    public ResponseEntity<OAuthLoginResponse> exchangeToken(
            @Valid @RequestBody OAuthExchangeRequest request) {
        OAuthLoginResponse response =
                exchangeCodeStore
                        .exchange(request.code())
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.OAUTH_EXCHANGE_CODE_INVALID));
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
