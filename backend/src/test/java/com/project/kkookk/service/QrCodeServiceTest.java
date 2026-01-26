package com.project.kkookk.service;

import com.project.kkookk.adapter.s3.FileStorageAdapter;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.repository.store.StoreRepository;
import com.project.kkookk.util.QrGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QrCodeServiceTest {

    @InjectMocks
    private QrCodeService qrCodeService;

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private QrGenerator qrGenerator;

    @Mock
    private FileStorageAdapter fileStorageAdapter;

    private final URL mockUrl = new URL("http://localhost:8080/files/qrs/store_1.png");

    QrCodeServiceTest() throws MalformedURLException {
    }

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(qrCodeService, "qrBaseUrl", "http://localhost:8080/c/s/");
    }

    @Test
    @DisplayName("QR 코드 URL 조회 성공: QR이 존재하지 않으면 새로 생성")
    void getQrCodeUrl_shouldGenerateQr_whenNotExists() {
        // given
        long storeId = 1L;
        long ownerId = 1L;
        String qrPath = "qrs/store_1.png";
        byte[] qrImage = new byte[10];

        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mock(Store.class)));
        when(fileStorageAdapter.doesObjectExist(qrPath)).thenReturn(false);
        when(qrGenerator.generateQrCode(anyString(), anyInt(), anyInt())).thenReturn(qrImage);
        when(fileStorageAdapter.getPresignedUrl(qrPath)).thenReturn(mockUrl);

        // when
        URL resultUrl = qrCodeService.getQrCodeUrl(storeId, ownerId);

        // then
        assertThat(resultUrl).isEqualTo(mockUrl);
        verify(qrGenerator, times(1)).generateQrCode(anyString(), anyInt(), anyInt());
        verify(fileStorageAdapter, times(1)).upload(eq(qrPath), eq(qrImage), eq("image/png"));
        verify(fileStorageAdapter, times(1)).getPresignedUrl(qrPath);
    }

    @Test
    @DisplayName("QR 코드 URL 조회 성공: QR이 이미 존재하면 생성 없이 반환")
    void getQrCodeUrl_shouldReturnUrl_whenExists() {
        // given
        long storeId = 1L;
        long ownerId = 1L;
        String qrPath = "qrs/store_1.png";

        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mock(Store.class)));
        when(fileStorageAdapter.doesObjectExist(qrPath)).thenReturn(true);
        when(fileStorageAdapter.getPresignedUrl(qrPath)).thenReturn(mockUrl);

        // when
        URL resultUrl = qrCodeService.getQrCodeUrl(storeId, ownerId);

        // then
        assertThat(resultUrl).isEqualTo(mockUrl);
        verify(qrGenerator, never()).generateQrCode(anyString(), anyInt(), anyInt());
        verify(fileStorageAdapter, never()).upload(anyString(), any(), anyString());
    }

    @Test
    @DisplayName("QR 코드 URL 조회 실패: 매장이 존재하지 않는 경우")
    void getQrCodeUrl_shouldFail_whenStoreNotFound() {
        // given
        long storeId = 999L;
        long ownerId = 1L;
        when(storeRepository.findById(storeId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> qrCodeService.getQrCodeUrl(storeId, ownerId))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
    }
}
