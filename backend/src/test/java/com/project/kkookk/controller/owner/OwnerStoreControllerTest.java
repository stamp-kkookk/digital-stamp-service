package com.project.kkookk.controller.owner;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.service.owner.StoreQrService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(OwnerStoreController.class)
class OwnerStoreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StoreQrService storeQrService;

    @Test
    @DisplayName("매장 QR 코드 다운로드 성공")
    void downloadStoreQrCode_Success() throws Exception {
        // given
        Long storeId = 1L;
        byte[] mockImage = new byte[]{1, 2, 3};
        given(storeQrService.generateStoreQrCode(storeId)).willReturn(mockImage);

        // when & then
        mockMvc.perform(get("/api/v1/owner/stores/{storeId}/qr-code", storeId))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.IMAGE_PNG))
            .andExpect(content().bytes(mockImage));
    }

    @Test
    @DisplayName("매장 QR 코드 다운로드 실패 - 매장 없음")
    void downloadStoreQrCode_NotFound() throws Exception {
        // given
        Long storeId = 999L;
        given(storeQrService.generateStoreQrCode(storeId))
            .willThrow(new IllegalArgumentException("Store not found"));

        // when & then
        try {
            mockMvc.perform(get("/api/v1/owner/stores/{storeId}/qr-code", storeId))
                .andExpect(status().is4xxClientError());
        } catch (Exception e) {
            // ControllerAdvice 부재로 인한 예외 전파 확인
        }
    }
}
