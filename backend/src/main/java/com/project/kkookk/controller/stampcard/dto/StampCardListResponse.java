package com.project.kkookk.controller.stampcard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import org.springframework.data.domain.Page;

@Schema(description = "스탬프 카드 목록 응답")
public record StampCardListResponse(
        @Schema(description = "스탬프 카드 목록") List<StampCardSummary> content,
        @Schema(description = "페이지 정보") PageInfo page) {

    public static StampCardListResponse from(Page<StampCardSummary> page) {
        return new StampCardListResponse(page.getContent(), PageInfo.from(page));
    }

    @Schema(description = "페이지 정보")
    public record PageInfo(
            @Schema(description = "현재 페이지 번호", example = "0") int number,
            @Schema(description = "페이지 크기", example = "20") int size,
            @Schema(description = "전체 요소 수", example = "100") long totalElements,
            @Schema(description = "전체 페이지 수", example = "5") int totalPages) {

        public static PageInfo from(Page<?> page) {
            return new PageInfo(
                    page.getNumber(),
                    page.getSize(),
                    page.getTotalElements(),
                    page.getTotalPages());
        }
    }
}
