package com.project.kkookk.service.owner;

import com.google.zxing.WriterException;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.global.util.QrCodeGenerator;
import com.project.kkookk.repository.store.StoreRepository;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreQrService {

    private final StoreRepository storeRepository;
    private final QrCodeGenerator qrCodeGenerator;

    @Value("${app.domain.customer-url:https://kkookk.com}")
    private String customerBaseUrl;

    public byte[] generateStoreQrCode(Long storeId) {
        // 1. Store 존재 확인
        Store store = storeRepository.findById(storeId)
            .orElseThrow(() -> new IllegalArgumentException("Store not found"));

        // TODO: Owner 권한 체크 (Security Context 연동 시 추가)

        // 2. QR URL 생성
        String qrUrl = String.format("%s/c/store/%d", customerBaseUrl, storeId);

        // 3. QR 이미지 생성
        try {
            byte[] qrImage = qrCodeGenerator.generateQrCodeImage(qrUrl);

            // 4. Audit Logging
            log.info("Audit:Action=DOWNLOAD_QR, StoreId={}, Result=SUCCESS", storeId);

            return qrImage;
        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code for storeId: {}", storeId, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }
}
