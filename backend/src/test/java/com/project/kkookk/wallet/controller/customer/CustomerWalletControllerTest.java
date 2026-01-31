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
import com.project.kkookk.wallet.dto.response.RedeemEventSummary;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventSummary;
import com.project.kkookk.wallet.dto.response.StoreInfo;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardSummary;
import com.project.kkookk.wallet.service.CustomerWalletService;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException;
import com.project.kkookk.wallet.service.exception.WalletStampCardAccessDeniedException;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("CustomerWalletController 테스트")
class CustomerWalletControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private CustomerWalletService customerWalletService;

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards - 지갑 홈 조회 성공")
    void getStampCardsByPhoneAndName_Success() throws Exception {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";

        StoreInfo storeInfo = new StoreInfo(10L, "꾹꾹 카페");
        WalletStampCardSummary summary =
                new WalletStampCardSummary(
                        1L,
                        100L,
                        "아메리카노 10잔 쿠폰",
                        7,
                        10,
                        70,
                        "아메리카노 1잔",
                        1,
                        3,
                        LocalDateTime.now().plusDays(30),
                        null,
                        null,
                        storeInfo,
                        LocalDateTime.now());

        WalletStampCardListResponse response =
                new WalletStampCardListResponse(1L, name, List.of(summary));

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
                .andExpect(jsonPath("$.customerName").value(name))
                .andExpect(jsonPath("$.stampCards").isArray())
                .andExpect(jsonPath("$.stampCards[0].title").value("아메리카노 10잔 쿠폰"))
                .andExpect(jsonPath("$.stampCards[0].currentStampCount").value(7))
                .andExpect(jsonPath("$.stampCards[0].progressPercentage").value(70))
                .andExpect(jsonPath("$.stampCards[0].store.storeName").value("꾹꾹 카페"));
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards - 유효성 검증 실패 (잘못된 전화번호 형식)")
    void getStampCardsByPhoneAndName_Fail_InvalidPhoneFormat() throws Exception {
        // given
        String invalidPhone = "01012345678"; // 하이픈 없음
        String name = "홍길동";

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stamp-cards")
                                .param("phone", invalidPhone)
                                .param("name", name))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards - 유효성 검증 실패 (이름 짧음)")
    void getStampCardsByPhoneAndName_Fail_NameTooShort() throws Exception {
        // given
        String phone = "010-1234-5678";
        String shortName = "홍"; // 2자 미만

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/stamp-cards")
                                .param("phone", phone)
                                .param("name", shortName))
                .andDo(print())
                .andExpect(status().isBadRequest());
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
    @DisplayName("GET /api/customer/wallet/stamp-cards/{id}/history - 스탬프 히스토리 조회 성공")
    void getStampHistory_Success() throws Exception {
        // given
        Long walletStampCardId = 1L;

        StampEventSummary eventSummary =
                new StampEventSummary(100L, null, 2, "아메리카노 2잔 구매", LocalDateTime.now());

        PageInfo pageInfo = new PageInfo(0, 20, 1, 1, true);

        StampEventHistoryResponse response =
                new StampEventHistoryResponse(List.of(eventSummary), pageInfo);

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
                .andExpect(jsonPath("$.events").isArray())
                .andExpect(jsonPath("$.events[0].delta").value(2))
                .andExpect(jsonPath("$.pageInfo.pageNumber").value(0))
                .andExpect(jsonPath("$.pageInfo.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards/{id}/history - 유효성 검증 실패 (page < 0)")
    void getStampHistory_Fail_InvalidPageParameter() throws Exception {
        // given
        Long walletStampCardId = 1L;

        // when & then
        mockMvc.perform(
                        get(
                                        "/api/customer/wallet/stamp-cards/{walletStampCardId}/history",
                                        walletStampCardId)
                                .param("page", "-1")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards/{id}/history - 유효성 검증 실패 (size > 100)")
    void getStampHistory_Fail_InvalidSizeParameter() throws Exception {
        // given
        Long walletStampCardId = 1L;

        // when & then
        mockMvc.perform(
                        get(
                                        "/api/customer/wallet/stamp-cards/{walletStampCardId}/history",
                                        walletStampCardId)
                                .param("page", "0")
                                .param("size", "101"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards/{id}/history - 권한 없음 (403)")
    void getStampHistory_Fail_AccessDenied() throws Exception {
        // given
        Long walletStampCardId = 1L;

        given(
                        customerWalletService.getStampHistory(
                                eq(walletStampCardId), anyLong(), any(Pageable.class)))
                .willThrow(new WalletStampCardAccessDeniedException("다른 고객의 스탬프카드에 접근할 수 없습니다"));

        // when & then
        mockMvc.perform(
                        get(
                                        "/api/customer/wallet/stamp-cards/{walletStampCardId}/history",
                                        walletStampCardId)
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/stamp-cards/{id}/history - 스탬프카드 없음 (404)")
    void getStampHistory_Fail_NotFound() throws Exception {
        // given
        Long walletStampCardId = 999L;

        given(
                        customerWalletService.getStampHistory(
                                eq(walletStampCardId), anyLong(), any(Pageable.class)))
                .willThrow(new WalletStampCardNotFoundException("해당 지갑 스탬프카드를 찾을 수 없습니다"));

        // when & then
        mockMvc.perform(
                        get(
                                        "/api/customer/wallet/stamp-cards/{walletStampCardId}/history",
                                        walletStampCardId)
                                .param("page", "0")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/redeem-history - 리워드 사용 히스토리 조회 성공")
    void getRedeemHistory_Success() throws Exception {
        // given
        StoreInfo storeInfo = new StoreInfo(10L, "꾹꾹 카페");
        RedeemEventSummary eventSummary =
                new RedeemEventSummary(100L, 200L, storeInfo, null, null, LocalDateTime.now());

        PageInfo pageInfo = new PageInfo(0, 20, 1, 1, true);

        RedeemEventHistoryResponse response =
                new RedeemEventHistoryResponse(List.of(eventSummary), pageInfo);

        given(customerWalletService.getRedeemHistory(anyLong(), any(Pageable.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/redeem-history")
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
    @DisplayName("GET /api/customer/wallet/redeem-history - 빈 목록 조회")
    void getRedeemHistory_EmptyList() throws Exception {
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
                .andExpect(jsonPath("$.events").isEmpty())
                .andExpect(jsonPath("$.pageInfo.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/customer/wallet/redeem-history - 유효성 검증 실패 (page < 0)")
    void getRedeemHistory_Fail_InvalidPageParameter() throws Exception {
        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/redeem-history")
                                .param("page", "-1")
                                .param("size", "20"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/customer/wallet/redeem-history - 유효성 검증 실패 (size > 100)")
    void getRedeemHistory_Fail_InvalidSizeParameter() throws Exception {
        // when & then
        mockMvc.perform(
                        get("/api/customer/wallet/redeem-history")
                                .param("page", "0")
                                .param("size", "200"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
