package com.project.kkookk.migration.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "스탬프 마이그레이션 요청 생성")
public record CreateMigrationRequest(
        @Schema(description = "매장 ID", example = "1") @NotNull(message = "매장 ID는 필수입니다")
                Long storeId,
        @Schema(
                        description = "종이 스탬프 판 이미지 (Base64 인코딩)",
                        example = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...")
                @NotBlank(message = "이미지 데이터는 필수입니다")
                String imageData,
        @Schema(description = "고객이 주장하는 스탬프 개수 (백오피스 자동 완성용, 사장님이 수정 가능)", example = "8")
                @NotNull(message = "스탬프 개수는 필수입니다")
                @Min(value = 1, message = "스탬프 개수는 1개 이상이어야 합니다")
                Integer claimedStampCount) {}
