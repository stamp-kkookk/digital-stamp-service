package com.kkookk.issuance.controller;

import com.kkookk.issuance.dto.CreateIssuanceRequest;
import com.kkookk.issuance.dto.IssuanceRequestResponse;
import com.kkookk.issuance.service.IssuanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issuance")
@RequiredArgsConstructor
public class IssuanceController {

    private final IssuanceService issuanceService;

    @PostMapping
    public ResponseEntity<IssuanceRequestResponse> createRequest(
            @RequestHeader("X-Wallet-Session") String sessionToken,
            @Valid @RequestBody CreateIssuanceRequest request) {

        IssuanceRequestResponse response = issuanceService.createIssuanceRequest(sessionToken, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssuanceRequestResponse> getRequest(@PathVariable Long id) {
        IssuanceRequestResponse response = issuanceService.getIssuanceRequest(id);
        return ResponseEntity.ok(response);
    }
}
