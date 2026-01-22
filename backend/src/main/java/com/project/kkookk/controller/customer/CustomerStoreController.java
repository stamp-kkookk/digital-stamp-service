package com.project.kkookk.controller.customer;

import com.project.kkookk.dto.store.StoreStampCardInfoResponse;
import com.project.kkookk.service.customer.CustomerStoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Customer Store API", description = "고객용 매장 정보 조회 API")
@RestController
@RequestMapping("/api/v1/customer/stores")
@RequiredArgsConstructor
public class CustomerStoreController {

    private final CustomerStoreService customerStoreService;

    @Operation(summary = "매장 스탬프 카드 정보 조회", description = "QR 코드를 통해 진입 시 매장의 활성 스탬프 카드 정보를 조회합니다.")
    @GetMapping("/{storeId}/stamp-card")
    public ResponseEntity<StoreStampCardInfoResponse> getStoreStampCard(@PathVariable Long storeId) {
        StoreStampCardInfoResponse response = customerStoreService.getStoreActiveStampCard(storeId);
        return ResponseEntity.ok(response);
    }
}
