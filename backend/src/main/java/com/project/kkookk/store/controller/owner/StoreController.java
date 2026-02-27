package com.project.kkookk.store.controller.owner;

import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.store.controller.owner.dto.StoreCreateRequest;
import com.project.kkookk.store.controller.owner.dto.StoreResponse;
import com.project.kkookk.store.controller.owner.dto.StoreUpdateRequest;
import com.project.kkookk.store.service.StoreService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/owner/stores")
public class StoreController implements StoreApi {

    private final StoreService storeService;

    @Override
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StoreResponse> createStore(
            @Valid @RequestPart("data") StoreCreateRequest request,
            @RequestPart(value = "icon", required = false) MultipartFile iconImage,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StoreResponse response =
                storeService.createStore(principal.getOwnerId(), request, iconImage);
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
    @PutMapping(value = "/{storeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StoreResponse> updateStore(
            @PathVariable Long storeId,
            @Valid @RequestPart("data") StoreUpdateRequest request,
            @RequestPart(value = "icon", required = false) MultipartFile iconImage,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StoreResponse response =
                storeService.updateStore(principal.getOwnerId(), storeId, request, iconImage);
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
