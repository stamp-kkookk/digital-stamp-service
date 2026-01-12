package com.kkookk.issuance.controller;

import com.kkookk.issuance.dto.IssuanceRequestResponse;
import com.kkookk.issuance.service.IssuanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/issuance")
@RequiredArgsConstructor
public class OwnerIssuanceController {

    private final IssuanceService issuanceService;

    @GetMapping("/pending")
    public ResponseEntity<List<IssuanceRequestResponse>> getPendingRequests(
            @RequestParam Long storeId) {

        List<IssuanceRequestResponse> requests = issuanceService.getPendingRequests(storeId);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<IssuanceRequestResponse> approveRequest(@PathVariable Long id) {
        IssuanceRequestResponse response = issuanceService.approveRequest(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<IssuanceRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String reason = body.getOrDefault("reason", "거부됨");
        IssuanceRequestResponse response = issuanceService.rejectRequest(id, reason);
        return ResponseEntity.ok(response);
    }
}
