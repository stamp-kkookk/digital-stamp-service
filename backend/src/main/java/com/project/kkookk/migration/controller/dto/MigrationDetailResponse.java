package com.project.kkookk.migration.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "마이그레이션 요청 상세 응답")
public record MigrationDetailResponse(
        @Schema(description = "요청 ID", example = "1") Long id,
        @Schema(description = "고객 지갑 ID", example = "100") Long customerWalletId,
        @Schema(description = "고객 전화번호", example = "010-1234-5678") String customerPhone,
        @Schema(description = "고객 이름", example = "홍길동") String customerName,
        @Schema(description = "이미지 URL", example = "https://storage.example.com/migrations/1.jpg")
                String imageUrl,
        @Schema(description = "고객이 주장한 스탬프 수", example = "5") Integer claimedStampCount,
        @Schema(description = "상태", example = "SUBMITTED") String status,
        @Schema(description = "승인된 스탬프 수", example = "5") Integer approvedStampCount,
        @Schema(description = "반려 사유", example = "사진이 불명확합니다") String rejectReason,
        @Schema(description = "요청 시간", example = "2026-01-30T14:30:00") LocalDateTime requestedAt,
        @Schema(description = "처리 시간", example = "2026-01-31T09:15:00")
                LocalDateTime processedAt) {}
