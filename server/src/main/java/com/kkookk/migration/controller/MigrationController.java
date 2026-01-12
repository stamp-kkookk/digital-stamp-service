package com.kkookk.migration.controller;

import com.kkookk.migration.dto.CreateMigrationRequest;
import com.kkookk.migration.dto.MigrationRequestResponse;
import com.kkookk.migration.service.MigrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/migration")
@RequiredArgsConstructor
public class MigrationController {

    private final MigrationService migrationService;

    @PostMapping
    public ResponseEntity<MigrationRequestResponse> createMigrationRequest(
            @RequestHeader("X-Wallet-Session") String sessionToken,
            @Valid @RequestBody CreateMigrationRequest request) {

        MigrationRequestResponse response = migrationService.createMigrationRequest(sessionToken, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MigrationRequestResponse>> getMyMigrationRequests(
            @RequestHeader("X-Wallet-Session") String sessionToken) {

        List<MigrationRequestResponse> requests = migrationService.getMyMigrationRequests(sessionToken);
        return ResponseEntity.ok(requests);
    }
}
