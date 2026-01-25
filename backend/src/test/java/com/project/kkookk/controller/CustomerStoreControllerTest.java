package com.project.kkookk.controller;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.common.exception.BusinessException;
import com.project.kkookk.common.exception.ErrorCode;
import com.project.kkookk.controller.dto.StampCardInfo;
import com.project.kkookk.controller.dto.StoreStampCardSummaryResponse;
import com.project.kkookk.service.CustomerStoreService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class CustomerStoreControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockBean private CustomerStoreService customerStoreService;

    @Test
    @DisplayName("API 요약 조회 성공: 활성 스탬프카드가 존재할 경우")
    void getStoreSummary_Success() throws Exception {
        // given
        long storeId = 1L;
        StampCardInfo stampCardInfo = new StampCardInfo(10L, "테스트 스탬프카드", "리워드", "혜택", "url");
        StoreStampCardSummaryResponse mockResponse =
                new StoreStampCardSummaryResponse("테스트 매장", stampCardInfo);

        given(customerStoreService.getStoreStampCardSummary(storeId)).willReturn(mockResponse);

        // when & then
        mockMvc.perform(get("/api/customer/stores/{storeId}/summary", storeId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.storeName").value("테스트 매장"))
                .andExpect(jsonPath("$.stampCard").exists())
                .andExpect(jsonPath("$.stampCard.name").value("테스트 스탬프카드"))
                .andDo(print());
    }

    @Test
    @DisplayName("API 요약 조회 성공: 활성 스탬프카드가 없을 경우 (EMPTY)")
    void getStoreSummary_Empty() throws Exception {
        // given
        long storeId = 2L;
        StoreStampCardSummaryResponse mockResponse =
                new StoreStampCardSummaryResponse("다른 매장", null);
        given(customerStoreService.getStoreStampCardSummary(storeId)).willReturn(mockResponse);

        // when & then
        mockMvc.perform(get("/api/customer/stores/{storeId}/summary", storeId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.storeName").value("다른 매장"))
                .andExpect(jsonPath("$.stampCard").doesNotExist())
                .andDo(print());
    }

    @Test
    @DisplayName("API 요약 조회 실패: 매장을 찾을 수 없는 경우 404 반환")
    void getStoreSummary_StoreNotFound() throws Exception {
        // given
        long storeId = 999L;
        given(customerStoreService.getStoreStampCardSummary(storeId))
                .willThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // when & then
        mockMvc.perform(get("/api/customer/stores/{storeId}/summary", storeId))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("STORE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("매장을 찾을 수 없습니다."))
                .andDo(print());
    }

    @Test
    @DisplayName("API 요약 조회 실패: 매장이 비활성 상태인 경우 404 반환")
    void getStoreSummary_StoreInactive() throws Exception {
        // given
        long storeId = 3L;
        given(customerStoreService.getStoreStampCardSummary(storeId))
                .willThrow(new BusinessException(ErrorCode.STORE_INACTIVE));

        // when & then
        mockMvc.perform(get("/api/customer/stores/{storeId}/summary", storeId))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("STORE_INACTIVE"))
                .andExpect(jsonPath("$.message").value("현재 운영 중인 매장이 아닙니다."))
                .andDo(print());
    }
}
