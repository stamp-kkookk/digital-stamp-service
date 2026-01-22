package com.project.kkookk.controller.owner;

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
                        description = "이메일 또는 로그인 ID 중복",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    ResponseEntity<OwnerSignupResponse> signup(@Valid @RequestBody OwnerSignupRequest request);
}
