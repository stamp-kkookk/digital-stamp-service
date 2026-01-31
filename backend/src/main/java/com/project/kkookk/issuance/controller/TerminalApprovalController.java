package com.project.kkookk.issuance.controller;

import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.issuance.controller.dto.IssuanceApprovalResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRejectionResponse;
import com.project.kkookk.issuance.controller.dto.PendingIssuanceRequestListResponse;
import com.project.kkookk.issuance.service.TerminalApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/terminal/{storeId}/issuance-requests")
public class TerminalApprovalController implements TerminalApprovalApi {

    private final TerminalApprovalService terminalApprovalService;

    @Override
    @GetMapping
    public ResponseEntity<PendingIssuanceRequestListResponse> getPendingRequests(
            @PathVariable Long storeId, @AuthenticationPrincipal OwnerPrincipal principal) {

        PendingIssuanceRequestListResponse response =
                terminalApprovalService.getPendingRequests(storeId, principal.getOwnerId());

        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/{id}/approve")
    public ResponseEntity<IssuanceApprovalResponse> approveRequest(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @AuthenticationPrincipal OwnerPrincipal principal) {

        IssuanceApprovalResponse response =
                terminalApprovalService.approveRequest(storeId, id, principal.getOwnerId());

        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/{id}/reject")
    public ResponseEntity<IssuanceRejectionResponse> rejectRequest(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @AuthenticationPrincipal OwnerPrincipal principal) {

        IssuanceRejectionResponse response =
                terminalApprovalService.rejectRequest(storeId, id, principal.getOwnerId());

        return ResponseEntity.ok(response);
    }
}
