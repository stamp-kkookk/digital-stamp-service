package com.kkookk.customer.controller;

import com.kkookk.customer.dto.*;
import com.kkookk.customer.service.OtpService;
import com.kkookk.customer.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final OtpService otpService;
    private final WalletService walletService;

    @PostMapping("/otp/send")
    public ResponseEntity<OtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String otpCode = otpService.sendOtp(request.getPhoneNumber());

        return ResponseEntity.ok(OtpResponse.builder()
                .success(true)
                .message("인증번호가 발송되었습니다.")
                .devOtpCode(otpCode) // DEV 모드에서만 포함
                .build());
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        otpService.verifyOtp(request.getPhoneNumber(), request.getOtpCode());

        return ResponseEntity.ok(OtpResponse.builder()
                .success(true)
                .message("인증이 완료되었습니다.")
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<WalletResponse> registerWallet(@Valid @RequestBody RegisterWalletRequest request) {
        WalletResponse response = walletService.registerWallet(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/access")
    public ResponseEntity<WalletResponse> accessWallet(@Valid @RequestBody AccessWalletRequest request) {
        WalletResponse response = walletService.accessWallet(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/otp/step-up")
    public ResponseEntity<OtpResponse> verifyStepUpOtp(
            @RequestHeader("X-Wallet-Session") String sessionToken,
            @Valid @RequestBody StepUpOtpRequest request) {

        otpService.verifyOtpForStepUp(sessionToken, request.getOtpCode());

        return ResponseEntity.ok(OtpResponse.builder()
                .success(true)
                .message("Step-up 인증이 완료되었습니다.")
                .build());
    }
}
