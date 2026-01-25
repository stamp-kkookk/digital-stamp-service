package com.project.kkookk.controller;

import com.project.kkookk.service.QrCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URL;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@Tag(name = "QR Code API", description = "점주용 매장 QR 코드 관리 API")
@RestController
@RequestMapping("/api/owner/stores/{storeId}")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;

    @Operation(
            summary = "매장 QR 코드 다운로드",
            description = "매장 고유의 QR 코드 이미지를 다운로드 받을 수 있는 URL로 리다이렉트합니다.")
    @GetMapping("/qr")
    public RedirectView downloadQrCode(
            //, @AuthenticationPrincipal UserPrincipal userPrincipal // TODO: Spring Security 적용 후 활성화
            @Parameter(description = "매장 ID") @PathVariable Long storeId
    ) {
        // Long ownerId = userPrincipal.getId();
        Long ownerId = 1L; // TODO: 임시로 사용하는 점주 ID, 실제 인증 객체로 교체 필요
        URL presignedUrl = qrCodeService.getQrCodeUrl(storeId, ownerId);
        return new RedirectView(presignedUrl.toString());
    }
}
