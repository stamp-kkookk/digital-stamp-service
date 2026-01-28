package com.project.kkookk.qrcode.controller;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.qrcode.service.QrCodeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class QrCodeControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private QrCodeService qrCodeService;

    @Test
    @DisplayName("QR 코드 조회 성공: Base64 문자열 반환")
    void getQrCode_shouldReturnBase64_onSuccess() throws Exception {
        // given
        long storeId = 1L;
        String mockBase64 =
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        when(qrCodeService.getQrCodeBase64(anyLong(), anyLong())).thenReturn(mockBase64);

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/qr", storeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.qrCodeBase64").value(mockBase64));
    }

    @Test
    @DisplayName("QR 코드 조회 실패: 매장이 존재하지 않는 경우 404 반환")
    void getQrCode_shouldReturn404_whenStoreNotFound() throws Exception {
        // given
        long storeId = 999L;
        when(qrCodeService.getQrCodeBase64(anyLong(), anyLong()))
                .thenThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/qr", storeId))
                .andExpect(status().isNotFound());
    }
}
