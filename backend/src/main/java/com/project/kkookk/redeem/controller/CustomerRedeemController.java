package com.project.kkookk.redeem.controller;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.CustomerPrincipal;
import com.project.kkookk.redeem.controller.dto.RedeemRewardRequest;
import com.project.kkookk.redeem.controller.dto.RedeemRewardResponse;
import com.project.kkookk.redeem.service.CustomerRedeemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/redeems")
public class CustomerRedeemController implements CustomerRedeemApi {

    private final CustomerRedeemService customerRedeemService;

    @Override
    @PostMapping
    public ResponseEntity<RedeemRewardResponse> redeemReward(
            @Valid @RequestBody RedeemRewardRequest request,
            @AuthenticationPrincipal CustomerPrincipal principal) {

        // OTP step-up 인증 필수
        if (!principal.isStepUp()) {
            throw new BusinessException(ErrorCode.STEPUP_REQUIRED);
        }

        RedeemRewardResponse response =
                customerRedeemService.redeemReward(principal.getWalletId(), request);

        return ResponseEntity.ok(response);
    }
}
