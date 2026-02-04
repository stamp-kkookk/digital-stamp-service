package com.project.kkookk.migration.controller;

import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.migration.controller.dto.MigrationApproveRequest;
import com.project.kkookk.migration.controller.dto.MigrationApproveResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationRejectRequest;
import com.project.kkookk.migration.controller.dto.MigrationRejectResponse;
import com.project.kkookk.migration.service.OwnerMigrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<MigrationListResponse> getList(
            @PathVariable Long storeId, @AuthenticationPrincipal OwnerPrincipal principal) {
        MigrationListResponse response =
                ownerMigrationService.getList(storeId, principal.getOwnerId());
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<MigrationDetailResponse> getDetail(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        MigrationDetailResponse response =
                ownerMigrationService.getDetail(storeId, id, principal.getOwnerId());
        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/{id}/approve")
    public ResponseEntity<MigrationApproveResponse> approve(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody MigrationApproveRequest request,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        MigrationApproveResponse response =
                ownerMigrationService.approve(storeId, id, request, principal.getOwnerId());
        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/{id}/reject")
    public ResponseEntity<MigrationRejectResponse> reject(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody MigrationRejectRequest request,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        MigrationRejectResponse response =
                ownerMigrationService.reject(storeId, id, request, principal.getOwnerId());
        return ResponseEntity.ok(response);
    }
}
