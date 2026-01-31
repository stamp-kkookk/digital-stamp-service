package com.project.kkookk.store.controller.customer;

import com.project.kkookk.store.dto.response.StorePublicInfoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Tag(name = "Public Store", description = "공개 매장 정보 API")
public interface StorePublicApi {

    @Operation(
            summary = "매장 공개 정보 조회 (QR 스캔 후)",
            description = "QR 스캔 후 진입 화면에서 표시할 매장 정보를 조회합니다. 인증이 필요하지 않습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "403", description = "매장이 비활성 상태"),
        @ApiResponse(responseCode = "404", description = "매장을 찾을 수 없음")
    })
    @GetMapping("/api/public/stores/{storeId}")
    ResponseEntity<StorePublicInfoResponse> getStorePublicInfo(
            @Parameter(description = "매장 ID", required = true) @PathVariable Long storeId);
}
