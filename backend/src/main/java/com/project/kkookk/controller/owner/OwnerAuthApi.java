package com.project.kkookk.controller.owner;

import com.project.kkookk.controller.owner.dto.OwnerLoginRequest;
import com.project.kkookk.controller.owner.dto.OwnerLoginResponse;
import com.project.kkookk.controller.owner.dto.OwnerSignupRequest;
import com.project.kkookk.controller.owner.dto.OwnerSignupResponse;
import com.project.kkookk.global.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Owner Auth", description = "점주 인증 API")
public interface OwnerAuthApi {

    @Operation(summary = "점주 회원가입", description = "새로운 점주 계정을 생성합니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "201",
                        description = "회원가입 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                OwnerSignupResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "409",
                        description = "이메일 중복",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<OwnerSignupResponse> signup(@Valid @RequestBody OwnerSignupRequest request);

    @Operation(summary = "점주 로그인", description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.")
    @ApiResponses(
            value = {
                @ApiResponse(
                        responseCode = "200",
                        description = "로그인 성공",
                        content =
                                @Content(
                                        schema =
                                                @Schema(
                                                        implementation =
                                                                OwnerLoginResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "401",
                        description = "로그인 실패 (이메일 또는 비밀번호 불일치)",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<OwnerLoginResponse> login(@Valid @RequestBody OwnerLoginRequest request);
}
