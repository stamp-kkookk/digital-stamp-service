package com.kkookk.stampcard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateStampCardRequest {

    @NotNull(message = "매장 ID는 필수입니다.")
    private Long storeId;

    @NotBlank(message = "스탬프 카드 제목은 필수입니다.")
    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
    private String title;

    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다.")
    private String description;

    @Size(max = 50, message = "테마 색상은 50자를 초과할 수 없습니다.")
    private String themeColor;

    @NotNull(message = "목표 스탬프 개수는 필수입니다.")
    @Min(value = 1, message = "목표 스탬프 개수는 최소 1개 이상이어야 합니다.")
    private Integer stampGoal;

    @Size(max = 200, message = "리워드 이름은 200자를 초과할 수 없습니다.")
    private String rewardName;

    @Min(value = 1, message = "리워드 유효기간은 최소 1일 이상이어야 합니다.")
    private Integer rewardExpiresInDays;
}
