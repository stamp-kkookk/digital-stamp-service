package com.project.kkookk.wallet.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

@Schema(description = "페이지 정보")
public record PageInfo(
        @Schema(description = "현재 페이지 번호 (0-based)", example = "0") int pageNumber,
        @Schema(description = "페이지 크기", example = "20") int pageSize,
        @Schema(description = "전체 요소 개수", example = "45") long totalElements,
        @Schema(description = "전체 페이지 수", example = "3") int totalPages,
        @Schema(description = "마지막 페이지 여부", example = "false") boolean isLast) {

    public static PageInfo from(Page<?> page) {
        return new PageInfo(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }
}
