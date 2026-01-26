package com.project.kkookk.qrcode.service;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final StoreRepository storeRepository;
    private final QrCodeGenerator qrCodeGenerator;

    @Value("${app.qr-base-url}")
    private String qrBaseUrl;

    private static final int QR_CODE_WIDTH = 300;
    private static final int QR_CODE_HEIGHT = 300;

    public String getQrCodeBase64(Long storeId, Long ownerId) {
        validateStoreOwner(storeId, ownerId);

        String qrContent = qrBaseUrl + storeId;
        byte[] qrCodeImage =
                qrCodeGenerator.generateQrCode(qrContent, QR_CODE_WIDTH, QR_CODE_HEIGHT);

        return Base64.getEncoder().encodeToString(qrCodeImage);
    }

    private void validateStoreOwner(Long storeId, Long ownerId) {
        Store store =
                storeRepository
                        .findById(storeId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // TODO: Store 엔티티에 ownerId 필드 또는 연관 관계 추가 후, 아래 주석 로직 활성화 필요
        // if (!store.getOwnerId().equals(ownerId)) {
        //     throw new BusinessException(ErrorCode.FORBIDDEN_ACCESS);
        // }
    }
}
