package com.project.kkookk.migration.controller;

import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.service.OwnerMigrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}
