package com.project.kkookk.controller.owner;

import com.project.kkookk.service.owner.StoreQrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Owner Store API", description = "점주용 매장 관리 API")
@RestController
@RequestMapping("/api/v1/owner/stores")
@RequiredArgsConstructor
public class OwnerStoreController {

    private final StoreQrService storeQrService;

    @Operation(summary = "매장 QR 코드 다운로드", description = "매장 접속용 QR 코드 이미지를 생성하여 다운로드합니다.")
    @GetMapping(value = "/{storeId}/qr-code", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> downloadStoreQrCode(@PathVariable Long storeId) {
        byte[] qrImage = storeQrService.generateStoreQrCode(storeId);
        return ResponseEntity.ok(qrImage);
    }
}
