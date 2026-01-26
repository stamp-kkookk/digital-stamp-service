package com.project.kkookk.stampcard.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "스탬프 카드 생성 요청")
public record CreateStampCardRequest(
        @Schema(description = "카드 이름", example = "커피 스탬프 카드")
                @NotBlank(message = "카드 이름은 필수입니다")
                @Size(max = 100, message = "카드 이름은 100자 이하여야 합니다")
                String title,
        @Schema(description = "목표 스탬프 수", example = "10")
                @NotNull(message = "목표 스탬프 수는 필수입니다")
                @Min(value = 1, message = "목표 스탬프 수는 1 이상이어야 합니다")
                @Max(value = 50, message = "목표 스탬프 수는 50 이하여야 합니다")
                Integer goalStampCount,
        @Schema(description = "리워드 달성 기준 스탬프 수", example = "10")
                @Min(value = 1, message = "리워드 달성 기준 스탬프 수는 1 이상이어야 합니다")
                @Max(value = 50, message = "리워드 달성 기준 스탬프 수는 50 이하여야 합니다")
                Integer requiredStamps,
        @Schema(description = "리워드 명", example = "아메리카노 1잔 무료")
                @Size(max = 255, message = "리워드 명은 255자 이하여야 합니다")
                String rewardName,
        @Schema(description = "리워드 수량", example = "1")
                @Min(value = 1, message = "리워드 수량은 1 이상이어야 합니다")
                Integer rewardQuantity,
        @Schema(description = "리워드 유효기간(일)", example = "30")
                @Min(value = 1, message = "리워드 유효기간은 1 이상이어야 합니다")
                Integer expireDays,
        @Schema(
                        description = "카드 디자인 정보(JSON)",
                        example = "{\"theme\": \"coffee\", \"color\": \"#8B4513\"}")
                String designJson) {}
