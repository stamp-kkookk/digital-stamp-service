package com.project.kkookk.qrcode.controller;

import com.project.kkookk.global.security.OwnerPrincipal;
import com.project.kkookk.qrcode.service.QrCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "QR Code API", description = "점주용 매장 QR 코드 관리 API")
@RestController
@RequestMapping("/api/owner/stores/{storeId}")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;

    @Operation(summary = "매장 QR 코드 조회", description = "매장 고유의 QR 코드 이미지를 Base64 인코딩된 문자열로 반환합니다.")
    @ApiResponse(
            responseCode = "200",
            description = "QR 코드 조회 성공",
            content = @Content(schema = @Schema(implementation = QrCodeResponse.class)))
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/qr")
    public ResponseEntity<QrCodeResponse> getQrCode(
            @AuthenticationPrincipal OwnerPrincipal principal,
            @Parameter(description = "매장 ID") @PathVariable Long storeId) {
        Long ownerId = principal.getOwnerId();
        String qrCodeBase64 = qrCodeService.getQrCodeBase64(storeId, ownerId);
        return ResponseEntity.ok(new QrCodeResponse(qrCodeBase64));
    }

    @Schema(description = "QR 코드 응답")
    public record QrCodeResponse(
            @Schema(
                            description = "Base64 인코딩된 QR 코드 이미지",
                            example =
                                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk"
                                            + "+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")
                    String qrCodeBase64) {}
}
