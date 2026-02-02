package com.project.kkookk.migration.controller;

import com.project.kkookk.migration.controller.dto.MigrationApproveRequest;
import com.project.kkookk.migration.controller.dto.MigrationApproveResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationRejectRequest;
import com.project.kkookk.migration.controller.dto.MigrationRejectResponse;
import com.project.kkookk.migration.service.OwnerMigrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner/stores/{storeId}/migrations")
public class OwnerMigrationController implements OwnerMigrationApi {

    private final OwnerMigrationService ownerMigrationService;

    public OwnerMigrationController(OwnerMigrationService ownerMigrationService) {
        this.ownerMigrationService = ownerMigrationService;
    }

    @Override
    @GetMapping
    public ResponseEntity<MigrationListResponse> getList(@PathVariable Long storeId) {
        MigrationListResponse response = ownerMigrationService.getList(storeId);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<MigrationDetailResponse> getDetail(
            @PathVariable Long storeId, @PathVariable Long id) {
        MigrationDetailResponse response = ownerMigrationService.getDetail(storeId, id);
        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/{id}/approve")
    public ResponseEntity<MigrationApproveResponse> approve(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody MigrationApproveRequest request) {
        MigrationApproveResponse response = ownerMigrationService.approve(storeId, id, request);
        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/{id}/reject")
    public ResponseEntity<MigrationRejectResponse> reject(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody MigrationRejectRequest request) {
        MigrationRejectResponse response = ownerMigrationService.reject(storeId, id, request);
        return ResponseEntity.ok(response);
    }
}
