package com.kkookk.redemption.controller;

import com.kkookk.redemption.dto.CreateRedeemSessionRequest;
import com.kkookk.redemption.dto.RedeemSessionResponse;
import com.kkookk.redemption.dto.RewardInstanceResponse;
import com.kkookk.redemption.service.RedemptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/redemption")
@RequiredArgsConstructor
public class RedemptionController {

    private final RedemptionService redemptionService;

    @GetMapping("/rewards")
    public ResponseEntity<List<RewardInstanceResponse>> getMyRewards(
            @RequestHeader("X-Wallet-Session") String sessionToken) {

        List<RewardInstanceResponse> rewards = redemptionService.getMyRewards(sessionToken);
        return ResponseEntity.ok(rewards);
    }

    @PostMapping("/sessions")
    public ResponseEntity<RedeemSessionResponse> createRedeemSession(
            @RequestHeader("X-Wallet-Session") String sessionToken,
            @Valid @RequestBody CreateRedeemSessionRequest request) {

        RedeemSessionResponse response = redemptionService.createRedeemSession(sessionToken, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{sessionToken}/complete")
    public ResponseEntity<RedeemSessionResponse> completeRedemption(
            @PathVariable String sessionToken) {

        RedeemSessionResponse response = redemptionService.completeRedemption(sessionToken);
        return ResponseEntity.ok(response);
    }
}
