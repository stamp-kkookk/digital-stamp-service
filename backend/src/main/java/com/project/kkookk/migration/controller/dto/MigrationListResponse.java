package com.project.kkookk.migration.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "마이그레이션 요청 목록 응답")
public record MigrationListResponse(
        @Schema(description = "마이그레이션 요청 목록") List<MigrationSummary> migrations) {

    @Schema(description = "마이그레이션 요청 요약")
    public record MigrationSummary(
            @Schema(description = "요청 ID", example = "1") Long id,
            @Schema(description = "고객 전화번호", example = "010-1234-5678") String customerPhone,
            @Schema(description = "고객 이름", example = "홍길동") String customerName,
            @Schema(description = "고객이 주장한 스탬프 수", example = "5") Integer claimedStampCount,
            @Schema(description = "상태", example = "SUBMITTED") String status,
            @Schema(description = "요청 시간", example = "2026-01-30T14:30:00")
                    LocalDateTime requestedAt) {}
}
