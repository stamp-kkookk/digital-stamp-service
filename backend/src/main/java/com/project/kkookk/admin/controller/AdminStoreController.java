package com.project.kkookk.admin.controller;

import com.project.kkookk.admin.controller.dto.AdminStoreResponse;
import com.project.kkookk.admin.controller.dto.AdminStoreStatusChangeRequest;
import com.project.kkookk.admin.controller.dto.StoreAuditLogResponse;
import com.project.kkookk.admin.service.AdminStoreService;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.store.domain.StoreStatus;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/stores")
public class AdminStoreController implements AdminStoreApi {

    private final AdminStoreService adminStoreService;

    @Override
    @GetMapping
    public ResponseEntity<List<AdminStoreResponse>> getStores(
            @RequestParam(required = false) StoreStatus status,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        List<AdminStoreResponse> response = adminStoreService.getAllStores(status);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{storeId}")
    public ResponseEntity<AdminStoreResponse> getStore(
            @PathVariable Long storeId, @AuthenticationPrincipal OwnerPrincipal principal) {
        AdminStoreResponse response = adminStoreService.getStore(storeId);
        return ResponseEntity.ok(response);
    }

    @Override
    @PatchMapping("/{storeId}/status")
    public ResponseEntity<AdminStoreResponse> changeStoreStatus(
            @PathVariable Long storeId,
            @Valid @RequestBody AdminStoreStatusChangeRequest request,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        AdminStoreResponse response =
                adminStoreService.changeStoreStatus(storeId, principal.getOwnerId(), request);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{storeId}/audit-logs")
    public ResponseEntity<List<StoreAuditLogResponse>> getAuditLogs(
            @PathVariable Long storeId, @AuthenticationPrincipal OwnerPrincipal principal) {
        List<StoreAuditLogResponse> response = adminStoreService.getAuditLogs(storeId);
        return ResponseEntity.ok(response);
    }
}
