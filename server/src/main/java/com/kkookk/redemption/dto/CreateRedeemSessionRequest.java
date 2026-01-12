package com.kkookk.redemption.dto;

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
public class CreateRedeemSessionRequest {

    @NotNull(message = "리워드 ID는 필수입니다")
    private Long rewardId;

    @NotBlank(message = "클라이언트 요청 ID는 필수입니다")
    private String clientRequestId;
}
