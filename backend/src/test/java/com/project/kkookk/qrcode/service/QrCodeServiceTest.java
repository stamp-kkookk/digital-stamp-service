package com.project.kkookk.qrcode.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import java.util.Base64;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class QrCodeServiceTest {

    @InjectMocks private QrCodeService qrCodeService;

    @Mock private StoreRepository storeRepository;

    @Mock private QrCodeGenerator qrCodeGenerator;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(qrCodeService, "qrBaseUrl", "http://localhost:8080/c/s/");
    }

    @Test
    @DisplayName("QR 코드 Base64 조회 성공")
    void getQrCodeBase64_shouldReturnBase64() {
        // given
        long storeId = 1L;
        long ownerId = 1L;
        byte[] qrImage = new byte[] {1, 2, 3, 4, 5};
        String expectedBase64 = Base64.getEncoder().encodeToString(qrImage);

        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mock(Store.class)));
        when(qrCodeGenerator.generateQrCode(anyString(), anyInt(), anyInt())).thenReturn(qrImage);

        // when
        String resultBase64 = qrCodeService.getQrCodeBase64(storeId, ownerId);

        // then
        assertThat(resultBase64).isEqualTo(expectedBase64);
        verify(qrCodeGenerator, times(1))
                .generateQrCode(eq("http://localhost:8080/c/s/" + storeId), eq(300), eq(300));
    }

    @Test
    @DisplayName("QR 코드 Base64 조회 실패: 매장이 존재하지 않는 경우")
    void getQrCodeBase64_shouldFail_whenStoreNotFound() {
        // given
        long storeId = 999L;
        long ownerId = 1L;
        when(storeRepository.findById(storeId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> qrCodeService.getQrCodeBase64(storeId, ownerId))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
    }
}
