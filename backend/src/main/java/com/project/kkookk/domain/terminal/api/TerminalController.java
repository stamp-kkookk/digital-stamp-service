package com.project.kkookk.domain.terminal.api;

import com.project.kkookk.common.dto.PageResponse;
import com.project.kkookk.domain.auth.application.AuthDetails;
import com.project.kkookk.domain.issuance.dto.PendingIssuanceRequestResponse;
import com.project.kkookk.domain.terminal.application.TerminalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "단말기(Terminal) API", description = "단말기 로그인, 스탬프 발급 승인/거절 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/terminals/{storeId}")
public class TerminalController {

    private final TerminalService terminalService;

    @Operation(summary = "스탬프 발급 요청 목록 조회", description = "현재 가게에 들어온 스탬프 발급 요청 목록을 폴링 방식으로 조회합니다.")
    @GetMapping("/issuance-requests")
    public ResponseEntity<PageResponse<PendingIssuanceRequestResponse>> getPendingIssuances(
            @PathVariable Long storeId,
            @AuthenticationPrincipal AuthDetails authDetails,
            @ParameterObject @PageableDefault(size = 10, sort = "requestedAt") Pageable pageable) {
        
        PageResponse<PendingIssuanceRequestResponse> response = terminalService.getPendingIssuances(
                storeId, authDetails.getUser(), pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "스탬프 발급 요청 승인", description = "특정 발급 요청을 승인 처리합니다.")
    @PostMapping("/issuance-requests/{requestId}/approval")
    public ResponseEntity<Void> approveIssuance(
            @PathVariable Long storeId,
            @PathVariable UUID requestId,
            @AuthenticationPrincipal AuthDetails authDetails) {
        
        terminalService.approveIssuance(storeId, requestId, authDetails.getUser());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "스탬프 발급 요청 거절", description = "특정 발급 요청을 거절 처리합니다.")
    @PostMapping("/issuance-requests/{requestId}/rejection")
    public ResponseEntity<Void> rejectIssuance(
            @PathVariable Long storeId,
            @PathVariable UUID requestId,
            @AuthenticationPrincipal AuthDetails authDetails) {
        
        terminalService.rejectIssuance(storeId, requestId, authDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
