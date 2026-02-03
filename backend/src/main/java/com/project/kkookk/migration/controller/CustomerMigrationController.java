package com.project.kkookk.migration.controller;

import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.migration.dto.CreateMigrationRequest;
import com.project.kkookk.migration.dto.MigrationListItemResponse;
import com.project.kkookk.migration.dto.MigrationRequestResponse;
import com.project.kkookk.migration.service.CustomerMigrationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/migrations")
public class CustomerMigrationController implements CustomerMigrationApi {

    private final CustomerMigrationService customerMigrationService;

    @Override
    @PostMapping
    public ResponseEntity<MigrationRequestResponse> createMigrationRequest(
            @Valid @RequestBody CreateMigrationRequest request,
            @AuthenticationPrincipal CustomerPrincipal principal) {

        MigrationRequestResponse response =
                customerMigrationService.createMigrationRequest(principal.getWalletId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<MigrationRequestResponse> getMigrationRequest(
            @PathVariable Long id, @AuthenticationPrincipal CustomerPrincipal principal) {

        MigrationRequestResponse response =
                customerMigrationService.getMigrationRequest(principal.getWalletId(), id);

        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<List<MigrationListItemResponse>> getMyMigrationRequests(
            @AuthenticationPrincipal CustomerPrincipal principal) {

        List<MigrationListItemResponse> responses =
                customerMigrationService.getMyMigrationRequests(principal.getWalletId());

        return ResponseEntity.ok(responses);
    }
}
