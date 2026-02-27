package com.project.kkookk.stampcard.controller;

import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.stampcard.controller.dto.CreateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.StampCardListResponse;
import com.project.kkookk.stampcard.controller.dto.StampCardResponse;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.service.StampCardService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/owner/stores/{storeId}/stamp-cards")
public class StampCardController implements StampCardApi {

    private final StampCardService stampCardService;

    public StampCardController(StampCardService stampCardService) {
        this.stampCardService = stampCardService;
    }

    @Override
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StampCardResponse> create(
            @PathVariable Long storeId,
            @Valid @RequestPart("data") CreateStampCardRequest request,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestPart(value = "stampImage", required = false) MultipartFile stampImage,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StampCardResponse response =
                stampCardService.create(
                        principal.getOwnerId(), storeId, request, backgroundImage, stampImage);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @GetMapping
    public ResponseEntity<StampCardListResponse> getList(
            @PathVariable Long storeId,
            @RequestParam(required = false) StampCardStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StampCardListResponse response =
                stampCardService.getList(principal.getOwnerId(), storeId, status, pageable);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<StampCardResponse> getById(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StampCardResponse response = stampCardService.getById(principal.getOwnerId(), storeId, id);
        return ResponseEntity.ok(response);
    }

    @Override
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StampCardResponse> update(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestPart("data") UpdateStampCardRequest request,
            @RequestPart(value = "backgroundImage", required = false) MultipartFile backgroundImage,
            @RequestPart(value = "stampImage", required = false) MultipartFile stampImage,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StampCardResponse response =
                stampCardService.update(
                        principal.getOwnerId(), storeId, id, request, backgroundImage, stampImage);
        return ResponseEntity.ok(response);
    }

    @Override
    @PatchMapping("/{id}/status")
    public ResponseEntity<StampCardResponse> updateStatus(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateStampCardStatusRequest request,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        StampCardResponse response =
                stampCardService.updateStatus(principal.getOwnerId(), storeId, id, request);
        return ResponseEntity.ok(response);
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long storeId,
            @PathVariable Long id,
            @AuthenticationPrincipal OwnerPrincipal principal) {
        stampCardService.delete(principal.getOwnerId(), storeId, id);
        return ResponseEntity.noContent().build();
    }
}
