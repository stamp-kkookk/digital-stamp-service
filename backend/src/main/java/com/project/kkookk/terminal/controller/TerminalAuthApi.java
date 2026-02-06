package com.project.kkookk.terminal.controller;

import com.project.kkookk.global.exception.ErrorResponse;
import com.project.kkookk.terminal.controller.dto.TerminalLoginRequest;
import com.project.kkookk.terminal.controller.dto.TerminalLoginResponse;
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

@Tag(name = "Terminal Auth", description = "터미널 인증 API")
@RequestMapping("/api/public/terminal")
public interface TerminalAuthApi {

    @Operation(summary = "터미널 로그인", description = "점주 계정으로 특정 매장의 터미널에 로그인합니다.")
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
                                                                TerminalLoginResponse.class))),
                @ApiResponse(
                        responseCode = "400",
                        description = "유효성 검증 실패",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "401",
                        description = "로그인 실패 (이메일 또는 비밀번호 불일치)",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                @ApiResponse(
                        responseCode = "403",
                        description = "해당 매장에 대한 접근 권한 없음",
                        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
            })
    @PostMapping("/login")
    ResponseEntity<TerminalLoginResponse> login(@Valid @RequestBody TerminalLoginRequest request);
}
