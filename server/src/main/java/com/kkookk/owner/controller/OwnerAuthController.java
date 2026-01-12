package com.kkookk.owner.controller;

import com.kkookk.owner.dto.AuthResponse;
import com.kkookk.owner.dto.LoginRequest;
import com.kkookk.owner.dto.RegisterRequest;
import com.kkookk.owner.service.OwnerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/auth")
@RequiredArgsConstructor
public class OwnerAuthController {

    private final OwnerAuthService ownerAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = ownerAuthService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = ownerAuthService.login(request);
        return ResponseEntity.ok(response);
    }
}
