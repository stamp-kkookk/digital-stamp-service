package com.kkookk.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpResponse {

    private boolean success;
    private String message;
    private String devOtpCode; // DEV 모드에서만 반환
}
