package com.project.kkookk.controller.store;

import com.project.kkookk.controller.store.dto.StoreCreateRequest;
import com.project.kkookk.controller.store.dto.StoreResponse;
import com.project.kkookk.controller.store.dto.StoreUpdateRequest;
import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.service.store.StoreService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 매장 관리 컨트롤러. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/stores")
public class StoreController implements StoreApi {

    private final StoreService storeService;

    @Override
    @PostMapping
    public ResponseEntity<StoreResponse> createStore(
            @Valid @RequestBody StoreCreateRequest request,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StoreResponse response = storeService.createStore(principal.getOwnerId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<List<StoreResponse>> getStores(
            @AuthenticationPrincipal OwnerPrincipal principal) {
        List<StoreResponse> response = storeService.getStores(principal.getOwnerId());
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{storeId}")
    public ResponseEntity<StoreResponse> getStore(
            @PathVariable Long storeId, @AuthenticationPrincipal OwnerPrincipal principal) {
        StoreResponse response = storeService.getStore(principal.getOwnerId(), storeId);
        return ResponseEntity.ok(response);
    }

    @Override
    @PutMapping("/{storeId}")
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable Long storeId,
            @Valid @RequestBody StoreUpdateRequest request,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StoreResponse response = storeService.updateStore(principal.getOwnerId(), storeId, request);
        return ResponseEntity.ok(response);
    }

    @Override
    @DeleteMapping("/{storeId}")
    public ResponseEntity<Void> deleteStore(
            @PathVariable Long storeId, @AuthenticationPrincipal OwnerPrincipal principal) {
        storeService.deleteStore(principal.getOwnerId(), storeId);
        return ResponseEntity.noContent().build();
    }
}
