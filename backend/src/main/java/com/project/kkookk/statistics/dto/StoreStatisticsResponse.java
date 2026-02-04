package com.project.kkookk.statistics.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "매장 통계 응답")
public record StoreStatisticsResponse(
        @Schema(description = "조회 기간 시작일", example = "2026-01-01") LocalDate startDate,
        @Schema(description = "조회 기간 종료일", example = "2026-01-31") LocalDate endDate,
        @Schema(description = "총 적립 스탬프 수", example = "1234") long totalStamps,
        @Schema(description = "총 발급된 리워드 수", example = "50") long totalRewardsIssued,
        @Schema(description = "총 사용된 리워드 수", example = "30") long totalRewardsRedeemed,
        @Schema(description = "활성 이용자 수 (기간 내 적립 또는 사용한 고유 고객)", example = "120")
                long activeUsers,
        @Schema(description = "일별 적립 추이") List<DailyStampCount> dailyTrend) {

    @Schema(description = "일별 적립 수")
    public record DailyStampCount(
            @Schema(description = "날짜", example = "2026-01-15") LocalDate date,
            @Schema(description = "적립 수", example = "45") long count) {}
}
