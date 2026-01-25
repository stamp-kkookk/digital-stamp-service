package com.project.kkookk.service;

import com.project.kkookk.adapter.s3.FileStorageAdapter;
import com.project.kkookk.common.exception.BusinessException;
import com.project.kkookk.common.exception.ErrorCode;
import com.project.kkookk.domain.Store;
import com.project.kkookk.repository.StoreRepository;
import com.project.kkookk.util.QrGenerator;
import java.net.URL;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QrCodeService {

    private final StoreRepository storeRepository;
    private final QrGenerator qrGenerator;
    private final FileStorageAdapter fileStorageAdapter;

    @Value("${app.qr-base-url}")
    private String qrBaseUrl;

    private static final String QR_CODE_PATH_PREFIX = "qrs/store_";
    private static final String QR_CODE_FILE_EXTENSION = ".png";
    private static final int QR_CODE_WIDTH = 300;
    private static final int QR_CODE_HEIGHT = 300;

    public URL getQrCodeUrl(Long storeId, Long ownerId) {
        validateStoreOwner(storeId, ownerId);

        String qrCodePath = getQrCodePath(storeId);

        if (!fileStorageAdapter.doesObjectExist(qrCodePath)) {
            generateAndStoreQrCode(storeId, qrCodePath);
        }

        return fileStorageAdapter.getPresignedUrl(qrCodePath);
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

    private void generateAndStoreQrCode(Long storeId, String qrCodePath) {
        String qrContent = qrBaseUrl + storeId;
        byte[] qrCodeImage = qrGenerator.generateQrCode(qrContent, QR_CODE_WIDTH, QR_CODE_HEIGHT);
        fileStorageAdapter.upload(qrCodePath, qrCodeImage, "image/png");
    }

    private String getQrCodePath(Long storeId) {
        return QR_CODE_PATH_PREFIX + storeId + QR_CODE_FILE_EXTENSION;
    }
}
