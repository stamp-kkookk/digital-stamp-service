package com.project.kkookk.owner.controller;

import com.project.kkookk.owner.controller.dto.OwnerLoginRequest;
import com.project.kkookk.owner.controller.dto.OwnerLoginResponse;
import com.project.kkookk.owner.controller.dto.OwnerSignupRequest;
import com.project.kkookk.owner.controller.dto.OwnerSignupResponse;
import com.project.kkookk.owner.service.OwnerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/auth")
public class OwnerAuthController implements OwnerAuthApi {

    private final OwnerAuthService ownerAuthService;

    @Override
    @PostMapping("/signup")
    public ResponseEntity<OwnerSignupResponse> signup(
            @Valid @RequestBody OwnerSignupRequest request) {
        OwnerSignupResponse response = ownerAuthService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @PostMapping("/login")
    public ResponseEntity<OwnerLoginResponse> login(@Valid @RequestBody OwnerLoginRequest request) {
        OwnerLoginResponse response = ownerAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
