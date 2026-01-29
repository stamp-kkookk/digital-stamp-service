package com.project.kkookk.store.controller.customer;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.store.dto.response.StorePublicInfoResponse;
import com.project.kkookk.store.service.StorePublicService;
import com.project.kkookk.store.service.exception.StoreInactiveException;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("StorePublicController 통합 테스트")
class StorePublicControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private StorePublicService storePublicService;

    @Test
    @DisplayName("GET /api/public/stores/{storeId} - 매장 정보 조회 성공")
    void getStorePublicInfo_Success() throws Exception {
        // given
        Long storeId = 1L;
        StorePublicInfoResponse response = new StorePublicInfoResponse(storeId, "꾹꾹 카페 강남점", 3);

        given(storePublicService.getStorePublicInfo(storeId)).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/public/stores/{storeId}", storeId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storeId").value(storeId))
                .andExpect(jsonPath("$.storeName").value("꾹꾹 카페 강남점"))
                .andExpect(jsonPath("$.activeStampCardCount").value(3));
    }

    @Test
    @DisplayName("GET /api/public/stores/{storeId} - 매장 없음 (404)")
    void getStorePublicInfo_Fail_NotFound() throws Exception {
        // given
        Long storeId = 999L;

        given(storePublicService.getStorePublicInfo(storeId))
                .willThrow(new StoreNotFoundException("매장을 찾을 수 없습니다"));

        // when & then
        mockMvc.perform(get("/api/public/stores/{storeId}", storeId))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/public/stores/{storeId} - 비활성 매장 (403)")
    void getStorePublicInfo_Fail_Inactive() throws Exception {
        // given
        Long storeId = 1L;

        given(storePublicService.getStorePublicInfo(storeId))
                .willThrow(new StoreInactiveException("해당 매장은 현재 이용할 수 없습니다"));

        // when & then
        mockMvc.perform(get("/api/public/stores/{storeId}", storeId))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/public/stores/{storeId} - 활성 스탬프카드 0개")
    void getStorePublicInfo_ZeroActiveCards() throws Exception {
        // given
        Long storeId = 1L;
        StorePublicInfoResponse response = new StorePublicInfoResponse(storeId, "꾹꾹 카페", 0);

        given(storePublicService.getStorePublicInfo(storeId)).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/public/stores/{storeId}", storeId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeStampCardCount").value(0));
    }
}
