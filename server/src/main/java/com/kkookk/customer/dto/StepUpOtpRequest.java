package com.kkookk.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StepUpOtpRequest {

    @NotBlank(message = "인증번호는 필수입니다")
    private String otpCode;
}
