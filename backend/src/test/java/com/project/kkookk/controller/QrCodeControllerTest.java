package com.project.kkookk.controller;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.common.exception.BusinessException;
import com.project.kkookk.common.exception.ErrorCode;
import com.project.kkookk.service.QrCodeService;
import java.net.URL;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class QrCodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QrCodeService qrCodeService;

    @Test
    @DisplayName("QR 코드 다운로드 성공: URL 리다이렉트")
    void downloadQrCode_shouldRedirect_onSuccess() throws Exception {
        // given
        long storeId = 1L;
        URL mockUrl = new URL("http://example.com/qr.png");
        when(qrCodeService.getQrCodeUrl(anyLong(), anyLong())).thenReturn(mockUrl);

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/qr", storeId))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl(mockUrl.toString()));
    }

    @Test
    @DisplayName("QR 코드 다운로드 실패: 매장이 존재하지 않는 경우 404 반환")
    void downloadQrCode_shouldReturn404_whenStoreNotFound() throws Exception {
        // given
        long storeId = 999L;
        when(qrCodeService.getQrCodeUrl(anyLong(), anyLong()))
            .thenThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/qr", storeId))
            .andExpect(status().isNotFound());
    }
}
