package com.project.kkookk.redeem.controller;

import com.project.kkookk.global.security.TerminalPrincipal;
import com.project.kkookk.redeem.controller.dto.PendingRedeemSessionListResponse;
import com.project.kkookk.redeem.service.TerminalRedeemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/terminal/{storeId}/redeem-sessions")
public class TerminalRedeemController implements TerminalRedeemApi {

    private final TerminalRedeemService terminalRedeemService;

    @Override
    @GetMapping
    public ResponseEntity<PendingRedeemSessionListResponse> getPendingRedeemSessions(
            @PathVariable Long storeId, @AuthenticationPrincipal TerminalPrincipal principal) {

        PendingRedeemSessionListResponse response =
                terminalRedeemService.getPendingRedeemSessions(storeId, principal.getOwnerId());

        return ResponseEntity.ok(response);
    }
}
