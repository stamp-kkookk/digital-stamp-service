package com.project.kkookk.store.controller.customer;

import com.project.kkookk.store.dto.response.StorePublicInfoResponse;
import com.project.kkookk.store.service.StorePublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class StorePublicController implements StorePublicApi {

    private final StorePublicService storePublicService;

    @Override
    public ResponseEntity<StorePublicInfoResponse> getStorePublicInfo(Long storeId) {
        StorePublicInfoResponse response = storePublicService.getStorePublicInfo(storeId);
        return ResponseEntity.ok(response);
    }
}
