package com.project.kkookk.controller.store.dto;

import com.project.kkookk.domain.store.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 매장 생성 요청 DTO.
 */
@Schema(description = "매장 생성 요청")
public record StoreCreateRequest(

        @Schema(description = "매장명", example = "스타벅스 강남점")
        @NotBlank(message = "매장명은 필수입니다")
        @Size(max = 100, message = "매장명은 100자 이하여야 합니다")
        String name,

        @Schema(description = "매장 주소", example = "서울시 강남구 테헤란로 123")
        @Size(max = 255, message = "주소는 255자 이하여야 합니다")
        String address,

        @Schema(description = "매장 전화번호", example = "02-1234-5678")
        @Size(max = 50, message = "전화번호는 50자 이하여야 합니다")
        String phone,

        @Schema(description = "매장 상태", example = "ACTIVE")
        @NotNull(message = "매장 상태는 필수입니다")
        StoreStatus status
) {
}
