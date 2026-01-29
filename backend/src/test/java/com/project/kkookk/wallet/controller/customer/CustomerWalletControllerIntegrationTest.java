package com.project.kkookk.wallet.controller.customer;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.dto.response.PageInfo;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import com.project.kkookk.wallet.service.CustomerWalletService;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("CustomerWalletController 통합 테스트")
class CustomerWalletControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private CustomerWalletService customerWalletService;

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards - 지갑 홈 조회 성공")
    void getStampCardsByPhoneAndName_Success() throws Exception {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";

        WalletStampCardListResponse response = new WalletStampCardListResponse(1L, name, List.of());

        given(
                        customerWalletService.getStampCardsByPhoneAndName(
                                eq(phone), eq(name), eq(StampCardSortType.LAST_STAMPED)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stamp-cards")
                                .param("phone", phone)
                                .param("name", name)
                                .param("sortBy", "LAST_STAMPED"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerWalletId").value(1))
                .andExpect(jsonPath("$.customerName").value(name));
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards - 지갑 없음 (404)")
    void getStampCardsByPhoneAndName_Fail_WalletNotFound() throws Exception {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";

        given(
                        customerWalletService.getStampCardsByPhoneAndName(
                                eq(phone), eq(name), any(StampCardSortType.class)))
                .willThrow(new CustomerWalletNotFoundException("해당 전화번호와 이름으로 지갑을 찾을 수 없습니다"));

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stamp-cards")
                                .param("phone", phone)
                                .param("name", name))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards - 차단된 지갑 (403)")
    void getStampCardsByPhoneAndName_Fail_WalletBlocked() throws Exception {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";

        given(
                        customerWalletService.getStampCardsByPhoneAndName(
                                eq(phone), eq(name), any(StampCardSortType.class)))
                .willThrow(new CustomerWalletBlockedException("차단된 지갑입니다"));

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stamp-cards")
                                .param("phone", phone)
                                .param("name", name))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/customer/wallet/stamp-cards/{id}/history - 스탬프 히스토리 조회 성공")
    void getStampHistory_Success() throws Exception {
        // given
        Long walletStampCardId = 1L;

        PageInfo pageInfo = new PageInfo(0, 20, 0, 0, true);
        StampEventHistoryResponse response = new StampEventHistoryResponse(List.of(), pageInfo);

        given(
                        customerWalletService.getStampHistory(
                                eq(walletStampCardId), anyLong(), any(Pageable.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get(
                                        "/api/customer/wallet/stamp-cards/{walletStampCardId}/history",
                                        walletStampCardId)
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageInfo.pageNumber").value(0));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/customer/wallet/redeem-history - 리워드 사용 히스토리 조회 성공")
    void getRedeemHistory_Success() throws Exception {
        // given
        PageInfo pageInfo = new PageInfo(0, 20, 0, 0, true);
        RedeemEventHistoryResponse response = new RedeemEventHistoryResponse(List.of(), pageInfo);

        given(customerWalletService.getRedeemHistory(anyLong(), any(Pageable.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/redeem-history")
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageInfo.totalElements").value(0));
    }
}
