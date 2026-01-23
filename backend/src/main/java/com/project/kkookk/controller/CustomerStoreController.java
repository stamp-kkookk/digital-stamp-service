package com.project.kkookk.controller;

import com.project.kkookk.controller.dto.StoreStampCardSummaryResponse;
import com.project.kkookk.service.CustomerStoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer/stores")
public class CustomerStoreController {

    private final CustomerStoreService customerStoreService;

    @GetMapping("/{storeId}/summary")
    public ResponseEntity<StoreStampCardSummaryResponse> getStoreSummary(@PathVariable Long storeId) {
        StoreStampCardSummaryResponse response = customerStoreService.getStoreStampCardSummary(storeId);
        return ResponseEntity.ok(response);
    }
}
