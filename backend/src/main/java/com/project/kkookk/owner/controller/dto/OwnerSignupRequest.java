package com.project.kkookk.owner.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "점주 회원가입 요청")
public record OwnerSignupRequest(
        @Schema(description = "이메일", example = "owner@example.com")
                @NotBlank(message = "이메일은 필수입니다")
                @Email(message = "올바른 이메일 형식이 아닙니다")
                @Size(max = 255, message = "이메일은 255자 이하여야 합니다")
                String email,
        @Schema(description = "비밀번호", example = "Password1!")
                @NotBlank(message = "비밀번호는 필수입니다")
                @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다")
                @Pattern(
                        regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]+$",
                        message = "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다")
                String password,
        @Schema(description = "이름 (선택)", example = "홍길동")
                @Size(max = 100, message = "이름은 100자 이하여야 합니다")
                String name,
        @Schema(description = "전화번호", example = "010-1234-5678")
                @NotBlank(message = "전화번호는 필수입니다")
                @Pattern(regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$", message = "올바른 전화번호 형식이 아닙니다")
                String phoneNumber) {}
