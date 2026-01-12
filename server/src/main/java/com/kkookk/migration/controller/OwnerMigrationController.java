package com.kkookk.migration.controller;

import com.kkookk.migration.dto.MigrationRequestResponse;
import com.kkookk.migration.service.MigrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/migration")
@RequiredArgsConstructor
public class OwnerMigrationController {

    private final MigrationService migrationService;

    @GetMapping("/submitted")
    public ResponseEntity<List<MigrationRequestResponse>> getSubmittedRequests(
            @RequestParam Long storeId) {

        List<MigrationRequestResponse> requests = migrationService.getSubmittedRequests(storeId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/all")
    public ResponseEntity<List<MigrationRequestResponse>> getAllRequests(
            @RequestParam Long storeId) {

        List<MigrationRequestResponse> requests = migrationService.getAllStoreMigrationRequests(storeId);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<MigrationRequestResponse> approveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {

        Integer approvedCount = body.get("approvedCount");
        MigrationRequestResponse response = migrationService.approveMigrationRequest(id, approvedCount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<MigrationRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String reason = body.getOrDefault("reason", "반려됨");
        MigrationRequestResponse response = migrationService.rejectMigrationRequest(id, reason);
        return ResponseEntity.ok(response);
    }
}
