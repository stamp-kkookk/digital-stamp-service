package com.kkookk.store.controller;

import com.kkookk.common.util.JwtUtil;
import com.kkookk.store.dto.CreateStoreRequest;
import com.kkookk.store.dto.StoreResponse;
import com.kkookk.store.dto.UpdateStoreRequest;
import com.kkookk.store.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<StoreResponse>> getStores(
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        List<StoreResponse> stores = storeService.getStoresByOwner(ownerId);
        return ResponseEntity.ok(stores);
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<StoreResponse> getStore(
            @PathVariable Long storeId,
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        StoreResponse store = storeService.getStore(storeId, ownerId);
        return ResponseEntity.ok(store);
    }

    @PostMapping
    public ResponseEntity<StoreResponse> createStore(
            @Valid @RequestBody CreateStoreRequest request,
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        StoreResponse store = storeService.createStore(request, ownerId);
        return ResponseEntity.ok(store);
    }

    @PutMapping("/{storeId}")
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable Long storeId,
            @Valid @RequestBody UpdateStoreRequest request,
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        StoreResponse store = storeService.updateStore(storeId, request, ownerId);
        return ResponseEntity.ok(store);
    }

    @DeleteMapping("/{storeId}")
    public ResponseEntity<Void> deleteStore(
            @PathVariable Long storeId,
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        storeService.deleteStore(storeId, ownerId);
        return ResponseEntity.noContent().build();
    }

    private Long extractOwnerIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.getOwnerIdFromToken(token);
    }
}
