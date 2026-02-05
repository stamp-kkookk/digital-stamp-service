package com.project.kkookk.stampcard.domain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "스탬프 카드 디자인 타입")
public enum StampCardDesignType {
    @Schema(description = "기본형 (컬러 선택형)")
    COLOR,

    @Schema(description = "이미지형 (업로드형)")
    IMAGE,

    @Schema(description = "퍼즐형 (특수형)")
    PUZZLE
}
