package com.project.kkookk.controller.stampcard;

import com.project.kkookk.controller.stampcard.dto.CreateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.StampCardListResponse;
import com.project.kkookk.controller.stampcard.dto.StampCardResponse;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.service.stampcard.StampCardService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner/stores/{storeId}/stamp-cards")
public class StampCardController implements StampCardApi {

    private final StampCardService stampCardService;

    public StampCardController(StampCardService stampCardService) {
        this.stampCardService = stampCardService;
    }

    @Override
    @PostMapping
    public ResponseEntity<StampCardResponse> create(
            @PathVariable Long storeId, @Valid @RequestBody CreateStampCardRequest request) {
        StampCardResponse response = stampCardService.create(storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<StampCardListResponse> getList(
            @PathVariable Long storeId,
            @RequestParam(required = false) StampCardStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        StampCardListResponse response = stampCardService.getList(storeId, status, pageable);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<StampCardResponse> getById(
            @PathVariable Long storeId, @PathVariable Long id) {
        StampCardResponse response = stampCardService.getById(storeId, id);
        return ResponseEntity.ok(response);
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<StampCardResponse> update(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateStampCardRequest request) {
        StampCardResponse response = stampCardService.update(storeId, id, request);
        return ResponseEntity.ok(response);
    }

    @Override
    @PatchMapping("/{id}/status")
    public ResponseEntity<StampCardResponse> updateStatus(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateStampCardStatusRequest request) {
        StampCardResponse response = stampCardService.updateStatus(storeId, id, request);
        return ResponseEntity.ok(response);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long storeId, @PathVariable Long id) {
        stampCardService.delete(storeId, id);
        return ResponseEntity.noContent().build();
    }
}
