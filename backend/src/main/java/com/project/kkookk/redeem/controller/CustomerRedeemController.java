package com.project.kkookk.redeem.controller;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.redeem.controller.dto.CreateRedeemSessionRequest;
import com.project.kkookk.redeem.controller.dto.RedeemSessionResponse;
import com.project.kkookk.redeem.service.CustomerRedeemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/redeem-sessions")
public class CustomerRedeemController implements CustomerRedeemApi {

    private final CustomerRedeemService customerRedeemService;

    @Override
    @PostMapping
    public ResponseEntity<RedeemSessionResponse> createRedeemSession(
            @Valid @RequestBody CreateRedeemSessionRequest request,
            @AuthenticationPrincipal CustomerPrincipal principal) {

        // OTP step-up 인증 필수
        if (!principal.isStepUp()) {
            throw new BusinessException(ErrorCode.STEPUP_REQUIRED);
        }

        RedeemSessionResponse response =
                customerRedeemService.createRedeemSession(principal.getWalletId(), request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @PostMapping("/{id}/complete")
    public ResponseEntity<RedeemSessionResponse> completeRedeemSession(
            @PathVariable Long id, @AuthenticationPrincipal CustomerPrincipal principal) {

        RedeemSessionResponse response =
                customerRedeemService.completeRedeemSession(id, principal.getWalletId());

        return ResponseEntity.ok(response);
    }
}
