package com.project.kkookk.otp.controller;

import com.project.kkookk.otp.controller.dto.OtpRequestRequest;
import com.project.kkookk.otp.controller.dto.OtpRequestResponse;
import com.project.kkookk.otp.controller.dto.OtpVerifyRequest;
import com.project.kkookk.otp.controller.dto.OtpVerifyResponse;
import com.project.kkookk.otp.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/otp")
@RequiredArgsConstructor
public class OtpController implements OtpApi {

    private final OtpService otpService;

    @Override
    @PostMapping("/request")
    public ResponseEntity<OtpRequestResponse> requestOtp(
            @Valid @RequestBody OtpRequestRequest request) {
        OtpRequestResponse response = otpService.requestOtp(request);
        return ResponseEntity.ok(response);
    }

    @Override
    @PostMapping("/verify")
    public ResponseEntity<OtpVerifyResponse> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request) {
        OtpVerifyResponse response = otpService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }
}
