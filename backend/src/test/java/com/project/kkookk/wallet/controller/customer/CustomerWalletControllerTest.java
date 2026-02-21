package com.project.kkookk.wallet.controller.customer;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.issuance.controller.config.WithMockCustomer;
import com.project.kkookk.wallet.dto.response.PageInfo;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.RedeemEventSummary;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventSummary;
import com.project.kkookk.wallet.dto.response.StoreInfo;
import com.project.kkookk.wallet.service.CustomerWalletService;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("CustomerWalletController 테스트")
class CustomerWalletControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private CustomerWalletService customerWalletService;

    @Test
    @DisplayName("GET /api/customer/wallet/stores/{storeId}/stamp-history - 스탬프 히스토리 조회 성공")
    @WithMockCustomer
    void getStampHistory_Success() throws Exception {
        // given
        Long storeId = 1L;

        StampEventSummary eventSummary =
                new StampEventSummary(100L, null, 2, "아메리카노 2잔 구매", LocalDateTime.now());

        PageInfo pageInfo = new PageInfo(0, 20, 1, 1, true);

        StampEventHistoryResponse response =
                new StampEventHistoryResponse(List.of(eventSummary), pageInfo);

        given(
                        customerWalletService.getStampHistoryByStore(
                                eq(storeId), anyLong(), any(Pageable.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/stamp-history", storeId)
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.events").isArray())
                .andExpect(jsonPath("$.events[0].delta").value(2))
                .andExpect(jsonPath("$.pageInfo.pageNumber").value(0))
                .andExpect(jsonPath("$.pageInfo.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stores/{storeId}/stamp-history - 유효성 검증 실패 (page < 0)")
    @WithMockCustomer
    void getStampHistory_Fail_InvalidPageParameter() throws Exception {
        // given
        Long storeId = 1L;

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/stamp-history", storeId)
                                .param("page", "-1")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stores/{storeId}/stamp-history - 유효성 검증 실패 (size > 100)")
    @WithMockCustomer
    void getStampHistory_Fail_InvalidSizeParameter() throws Exception {
        // given
        Long storeId = 1L;

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/stamp-history", storeId)
                                .param("page", "0")
                                .param("size", "101"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stores/{storeId}/stamp-history - 스탬프카드 없음 (404)")
    @WithMockCustomer
    void getStampHistory_Fail_NotFound() throws Exception {
        // given
        Long storeId = 999L;

        given(
                        customerWalletService.getStampHistoryByStore(
                                eq(storeId), anyLong(), any(Pageable.class)))
                .willThrow(new WalletStampCardNotFoundException("해당 매장의 스탬프카드를 찾을 수 없습니다"));

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/stamp-history", storeId)
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stores/{storeId}/redeem-history - 리워드 사용 히스토리 조회 성공")
    @WithMockCustomer
    void getRedeemHistory_Success() throws Exception {
        // given
        Long storeId = 10L;
        StoreInfo storeInfo = new StoreInfo(storeId, "꾹꾹 카페");
        RedeemEventSummary eventSummary =
                new RedeemEventSummary(100L, 200L, storeInfo, null, LocalDateTime.now());

        PageInfo pageInfo = new PageInfo(0, 20, 1, 1, true);

        RedeemEventHistoryResponse response =
                new RedeemEventHistoryResponse(List.of(eventSummary), pageInfo);

        given(
                        customerWalletService.getRedeemHistoryByStore(
                                eq(storeId), anyLong(), any(Pageable.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/redeem-history", storeId)
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.events").isArray())
                .andExpect(jsonPath("$.events[0].store.storeName").value("꾹꾹 카페"))
                .andExpect(jsonPath("$.pageInfo.pageNumber").value(0))
                .andExpect(jsonPath("$.pageInfo.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stores/{storeId}/redeem-history - 빈 목록 조회")
    @WithMockCustomer
    void getRedeemHistory_EmptyList() throws Exception {
        // given
        Long storeId = 10L;
        PageInfo pageInfo = new PageInfo(0, 20, 0, 0, true);
        RedeemEventHistoryResponse response = new RedeemEventHistoryResponse(List.of(), pageInfo);

        given(
                        customerWalletService.getRedeemHistoryByStore(
                                eq(storeId), anyLong(), any(Pageable.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/redeem-history", storeId)
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.events").isEmpty())
                .andExpect(jsonPath("$.pageInfo.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stores/{storeId}/redeem-history - 유효성 검증 실패 (page < 0)")
    @WithMockCustomer
    void getRedeemHistory_Fail_InvalidPageParameter() throws Exception {
        // given
        Long storeId = 10L;

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/redeem-history", storeId)
                                .param("page", "-1")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName(
            "GET /api/customer/wallet/stores/{storeId}/redeem-history - 유효성 검증 실패 (size > 100)")
    @WithMockCustomer
    void getRedeemHistory_Fail_InvalidSizeParameter() throws Exception {
        // given
        Long storeId = 10L;

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stores/{storeId}/redeem-history", storeId)
                                .param("page", "0")
                                .param("size", "200"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
