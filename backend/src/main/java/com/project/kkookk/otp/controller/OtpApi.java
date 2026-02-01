package com.project.kkookk.otp.controller;

import com.project.kkookk.otp.dto.OtpRequestDto;
import com.project.kkookk.otp.dto.OtpRequestResponse;
import com.project.kkookk.otp.dto.OtpVerifyDto;
import com.project.kkookk.otp.dto.OtpVerifyResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "OTP", description = "OTP 인증 API")
@RequestMapping("/api/public/otp")
public interface OtpApi {

    @Operation(summary = "OTP 요청", description = "전화번호로 OTP를 요청합니다. 1분에 1회만 요청 가능합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "OTP 요청 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                OtpRequestResponse.class))),
                @ApiResponse(responseCode = "400", description = "잘못된 전화번호 형식"),
                @ApiResponse(responseCode = "429", description = "Rate limit 초과 (1분에 1회 제한)")
            })
    @PostMapping("/request")
    ResponseEntity<OtpRequestResponse> requestOtp(@Valid @RequestBody OtpRequestDto request);

    @Operation(summary = "OTP 검증", description = "전화번호와 OTP 코드를 검증합니다. 최대 3회 시도 가능합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "OTP 검증 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(implementation = OtpVerifyResponse.class))),
                @ApiResponse(responseCode = "400", description = "잘못된 요청 형식"),
                @ApiResponse(responseCode = "401", description = "OTP 만료 또는 불일치 또는 시도 횟수 초과")
            })
    @PostMapping("/verify")
    ResponseEntity<OtpVerifyResponse> verifyOtp(@Valid @RequestBody OtpVerifyDto request);
}
