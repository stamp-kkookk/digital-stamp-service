package com.project.kkookk.statistics.controller;

import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.statistics.dto.StoreStatisticsResponse;
import com.project.kkookk.statistics.service.OwnerStatisticsService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/stores/{storeId}/statistics")
public class OwnerStatisticsController implements OwnerStatisticsApi {

    private final OwnerStatisticsService ownerStatisticsService;

    @Override
    @GetMapping
    public ResponseEntity<StoreStatisticsResponse> getStoreStatistics(
            @PathVariable Long storeId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @AuthenticationPrincipal OwnerPrincipal principal) {

        // 기본값: 최근 30일
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusDays(30);

        StoreStatisticsResponse response =
                ownerStatisticsService.getStoreStatistics(
                        storeId, principal.getOwnerId(), start, end);

        return ResponseEntity.ok(response);
    }
}
