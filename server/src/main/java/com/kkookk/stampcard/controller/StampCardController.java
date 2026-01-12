package com.kkookk.stampcard.controller;

import com.kkookk.common.util.JwtUtil;
import com.kkookk.stampcard.dto.CreateStampCardRequest;
import com.kkookk.stampcard.dto.StampCardResponse;
import com.kkookk.stampcard.service.StampCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/owner/stampcards")
@RequiredArgsConstructor
public class StampCardController {

    private final StampCardService stampCardService;
    private final JwtUtil jwtUtil;

    @GetMapping("/{stampCardId}")
    public ResponseEntity<StampCardResponse> getStampCard(
            @PathVariable Long stampCardId,
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        StampCardResponse stampCard = stampCardService.getStampCard(stampCardId, ownerId);
        return ResponseEntity.ok(stampCard);
    }

    @GetMapping("/store/{storeId}/active")
    public ResponseEntity<StampCardResponse> getActiveStampCard(
            @PathVariable Long storeId,
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        Optional<StampCardResponse> stampCard = stampCardService.getActiveStampCardByStore(storeId, ownerId);

        return stampCard
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StampCardResponse> createStampCard(
            @Valid @RequestBody CreateStampCardRequest request,
            @RequestHeader("Authorization") String authHeader) {
        Long ownerId = extractOwnerIdFromToken(authHeader);
        StampCardResponse stampCard = stampCardService.createStampCard(request, ownerId);
        return ResponseEntity.ok(stampCard);
    }

    private Long extractOwnerIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.getOwnerIdFromToken(token);
    }
}
