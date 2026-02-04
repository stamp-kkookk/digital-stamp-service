package com.project.kkookk.otp.controller;

import com.project.kkookk.otp.dto.OtpRequestDto;
import com.project.kkookk.otp.dto.OtpRequestResponse;
import com.project.kkookk.otp.dto.OtpVerifyDto;
import com.project.kkookk.otp.dto.OtpVerifyResponse;
import com.project.kkookk.otp.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OtpController implements OtpApi {

    private final OtpService otpService;

    // TODO: 시연용 - 프로덕션 배포 시 devOtpCode 응답 제거 필요
    @Override
    public ResponseEntity<OtpRequestResponse> requestOtp(
            @Valid @RequestBody OtpRequestDto request) {
        String otpCode = otpService.requestOtp(request.phone());
        return ResponseEntity.ok(new OtpRequestResponse(true, otpCode));
    }

    @Override
    public ResponseEntity<OtpVerifyResponse> verifyOtp(@Valid @RequestBody OtpVerifyDto request) {
        boolean verified = otpService.verifyOtp(request.phone(), request.code());
        return ResponseEntity.ok(new OtpVerifyResponse(verified));
    }
}
