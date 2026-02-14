package com.project.kkookk.redeem.controller.owner;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import com.project.kkookk.owner.controller.config.WithMockOwner;
import com.project.kkookk.redeem.controller.owner.dto.RedeemEventResponse;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.domain.RedeemEventType;
import com.project.kkookk.redeem.service.OwnerRedeemEventService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(
        controllers = OwnerRedeemEventController.class,
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import(TestSecurityConfig.class)
@WithMockOwner(ownerId = 1L, email = "owner@example.com")
class OwnerRedeemEventControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private OwnerRedeemEventService ownerRedeemEventService;

    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired private WebApplicationContext context;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    private static final Long OWNER_ID = 1L;
    private static final Long STORE_ID = 1L;

    @Test
    @DisplayName("리딤 이벤트 조회 성공 - 200 OK")
    void getRedeemEvents_Success() throws Exception {
        // given
        RedeemEventResponse event =
                new RedeemEventResponse(
                        1L,
                        100L,
                        "커피러버",
                        "010-1234-5678",
                        "아메리카노 1잔",
                        "커피전문점 스탬프카드",
                        RedeemEventType.COMPLETED,
                        RedeemEventResult.SUCCESS,
                        LocalDateTime.of(2026, 2, 4, 14, 30, 0));

        Page<RedeemEventResponse> page = new PageImpl<>(List.of(event), PageRequest.of(0, 20), 1);

        given(
                        ownerRedeemEventService.getCompletedRedeemEvents(
                                anyLong(), anyLong(), anyInt(), anyInt()))
                .willReturn(page);

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/redeem-events", STORE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].redeemSessionId").value(100))
                .andExpect(jsonPath("$.content[0].customerNickname").value("커피러버"))
                .andExpect(jsonPath("$.content[0].rewardName").value("아메리카노 1잔"))
                .andExpect(jsonPath("$.content[0].stampCardTitle").value("커피전문점 스탬프카드"))
                .andExpect(jsonPath("$.content[0].type").value("COMPLETED"))
                .andExpect(jsonPath("$.content[0].result").value("SUCCESS"))
                .andExpect(jsonPath("$.pageNumber").value(0))
                .andExpect(jsonPath("$.pageSize").value(20))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.isLast").value(true));
    }

    @Test
    @DisplayName("리딤 이벤트 조회 - 빈 결과 - 200 OK")
    void getRedeemEvents_EmptyResult() throws Exception {
        // given
        Page<RedeemEventResponse> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);

        given(
                        ownerRedeemEventService.getCompletedRedeemEvents(
                                anyLong(), anyLong(), anyInt(), anyInt()))
                .willReturn(emptyPage);

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/redeem-events", STORE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("리딤 이벤트 조회 실패 - 매장 없음 - 404 Not Found")
    void getRedeemEvents_StoreNotFound() throws Exception {
        // given
        given(
                        ownerRedeemEventService.getCompletedRedeemEvents(
                                anyLong(), anyLong(), anyInt(), anyInt()))
                .willThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND));

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/redeem-events", STORE_ID))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("리딤 이벤트 조회 - 페이징 파라미터 적용")
    void getRedeemEvents_WithPagination() throws Exception {
        // given
        Page<RedeemEventResponse> page = new PageImpl<>(List.of(), PageRequest.of(2, 10), 25);

        given(ownerRedeemEventService.getCompletedRedeemEvents(OWNER_ID, STORE_ID, 2, 10))
                .willReturn(page);

        // when & then
        mockMvc.perform(
                        get("/api/owner/stores/{storeId}/redeem-events", STORE_ID)
                                .param("page", "2")
                                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageNumber").value(2))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.totalPages").value(3));
    }
}
