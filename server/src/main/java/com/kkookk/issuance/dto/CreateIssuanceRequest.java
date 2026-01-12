package com.kkookk.issuance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateIssuanceRequest {

    @NotNull(message = "매장 ID는 필수입니다")
    private Long storeId;

    @NotBlank(message = "클라이언트 요청 ID는 필수입니다")
    private String clientRequestId;
}
