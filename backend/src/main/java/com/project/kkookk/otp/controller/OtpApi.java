package com.project.kkookk.otp.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.otp.controller.dto.OtpRequestRequest;
import com.project.kkookk.otp.controller.dto.OtpRequestResponse;
import com.project.kkookk.otp.controller.dto.OtpVerifyRequest;
import com.project.kkookk.otp.controller.dto.OtpVerifyResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "OTP", description = "OTP 인증 API")
public interface OtpApi {

    @Operation(summary = "OTP 요청", description = "전화번호로 OTP 인증 코드를 발송합니다. (3분 유효, 1분 내 3회 제한)")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "OTP 발송 성공",
                        content =
                                @Content(
                                        schema = @Schema(implementation = OtpRequestResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패 (전화번호 형식 오류)",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "429",
                        description = "요청 횟수 초과 (1분 내 3회 제한)",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "503",
                        description = "SMS 발송 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<OtpRequestResponse> requestOtp(@Valid @RequestBody OtpRequestRequest request);

    @Operation(summary = "OTP 검증", description = "전화번호와 OTP 코드를 검증합니다. (최대 5회 시도)")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "OTP 검증 성공",
                        content =
                                @Content(schema = @Schema(implementation = OtpVerifyResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패 또는 OTP 불일치",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "404",
                        description = "OTP 세션을 찾을 수 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<OtpVerifyResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request);
}
