package com.project.kkookk.issuance.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.JwtAuthenticationFilter;
import com.project.kkookk.issuance.controller.config.WithMockCustomer;
import com.project.kkookk.issuance.controller.dto.CreateIssuanceRequest;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResult;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import com.project.kkookk.issuance.service.CustomerIssuanceService;
import com.project.kkookk.issuance.service.exception.IssuanceRequestAlreadyPendingException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestNotFoundException;
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@WebMvcTest(
        controllers = CustomerIssuanceController.class,
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import(TestSecurityConfig.class)
@WithMockCustomer(walletId = 1L, phone = "010-1234-5678")
class CustomerIssuanceControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @Autowired private WebApplicationContext context;

    @MockitoBean private CustomerIssuanceService customerIssuanceService;

    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Nested
    @DisplayName("POST /api/customer/issuance-requests")
    class CreateIssuanceRequestTest {

        @Test
        @DisplayName("적립 요청 생성 성공 - 201 Created")
        void createIssuanceRequest_Success() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(1L, 10L, "550e8400-e29b-41d4-a716-446655440000");

            LocalDateTime now = LocalDateTime.now();
            IssuanceRequestResponse response =
                    new IssuanceRequestResponse(
                            1L,
                            IssuanceRequestStatus.PENDING,
                            now.plusSeconds(120),
                            120L,
                            "REQ-20250129-1",
                            3,
                            4,
                            now);

            given(
                            customerIssuanceService.createIssuanceRequest(
                                    eq(1L), any(CreateIssuanceRequest.class)))
                    .willReturn(new IssuanceRequestResult(response, true));

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.currentStampCount").value(3))
                    .andExpect(jsonPath("$.afterStampCount").value(4));
        }

        @Test
        @DisplayName("적립 요청 생성 성공 - 멱등성으로 기존 요청 반환 200 OK")
        void createIssuanceRequest_Success_Idempotent() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(1L, 10L, "550e8400-e29b-41d4-a716-446655440000");

            LocalDateTime now = LocalDateTime.now();
            IssuanceRequestResponse response =
                    new IssuanceRequestResponse(
                            1L,
                            IssuanceRequestStatus.PENDING,
                            now.plusSeconds(60),
                            60L,
                            "REQ-20250129-1",
                            3,
                            4,
                            now);

            given(
                            customerIssuanceService.createIssuanceRequest(
                                    eq(1L), any(CreateIssuanceRequest.class)))
                    .willReturn(new IssuanceRequestResult(response, false));

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 매장 ID 누락 (400)")
        void createIssuanceRequest_Fail_StoreIdRequired() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(null, 10L, "550e8400-e29b-41d4-a716-446655440000");

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 지갑 스탬프카드 ID 누락 (400)")
        void createIssuanceRequest_Fail_WalletStampCardIdRequired() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(1L, null, "550e8400-e29b-41d4-a716-446655440000");

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 멱등성 키 누락 (400)")
        void createIssuanceRequest_Fail_IdempotencyKeyRequired() throws Exception {
            // given
            CreateIssuanceRequest request = new CreateIssuanceRequest(1L, 10L, "");

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 매장 없음 (404)")
        void createIssuanceRequest_Fail_StoreNotFound() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(999L, 10L, "550e8400-e29b-41d4-a716-446655440000");

            given(
                            customerIssuanceService.createIssuanceRequest(
                                    eq(1L), any(CreateIssuanceRequest.class)))
                    .willThrow(new BusinessException(ErrorCode.STORE_NOT_FOUND));

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("STORE_NOT_FOUND"));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 지갑 스탬프카드 없음 (404)")
        void createIssuanceRequest_Fail_WalletStampCardNotFound() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(1L, 999L, "550e8400-e29b-41d4-a716-446655440000");

            given(
                            customerIssuanceService.createIssuanceRequest(
                                    eq(1L), any(CreateIssuanceRequest.class)))
                    .willThrow(new WalletStampCardNotFoundException());

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("WALLET_STAMP_CARD_NOT_FOUND"));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 본인 지갑이 아님 (403)")
        void createIssuanceRequest_Fail_AccessDenied() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(1L, 10L, "550e8400-e29b-41d4-a716-446655440000");

            given(
                            customerIssuanceService.createIssuanceRequest(
                                    eq(1L), any(CreateIssuanceRequest.class)))
                    .willThrow(new BusinessException(ErrorCode.ACCESS_DENIED));

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 이미 대기 중인 요청 존재 (409)")
        void createIssuanceRequest_Fail_AlreadyPending() throws Exception {
            // given
            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(1L, 10L, "different-idempotency-key");

            given(
                            customerIssuanceService.createIssuanceRequest(
                                    eq(1L), any(CreateIssuanceRequest.class)))
                    .willThrow(new IssuanceRequestAlreadyPendingException());

            // when & then
            mockMvc.perform(
                            post("/api/customer/issuance-requests")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("ISSUANCE_REQUEST_ALREADY_PENDING"));
        }
    }

    @Nested
    @DisplayName("GET /api/customer/issuance-requests/{id}")
    class GetIssuanceRequestTest {

        @Test
        @DisplayName("적립 요청 상태 조회 성공 - PENDING")
        void getIssuanceRequest_Success_Pending() throws Exception {
            // given
            Long requestId = 1L;
            LocalDateTime now = LocalDateTime.now();
            IssuanceRequestResponse response =
                    new IssuanceRequestResponse(
                            requestId,
                            IssuanceRequestStatus.PENDING,
                            now.plusSeconds(60),
                            60L,
                            "REQ-20250129-1",
                            3,
                            4,
                            now);

            given(customerIssuanceService.getIssuanceRequest(requestId, 1L)).willReturn(response);

            // when & then
            mockMvc.perform(get("/api/customer/issuance-requests/{id}", requestId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(requestId))
                    .andExpect(jsonPath("$.status").value("PENDING"))
                    .andExpect(jsonPath("$.remainingSeconds").value(60));
        }

        @Test
        @DisplayName("적립 요청 상태 조회 성공 - APPROVED")
        void getIssuanceRequest_Success_Approved() throws Exception {
            // given
            Long requestId = 1L;
            LocalDateTime now = LocalDateTime.now();
            IssuanceRequestResponse response =
                    new IssuanceRequestResponse(
                            requestId,
                            IssuanceRequestStatus.APPROVED,
                            now.plusSeconds(60),
                            60L,
                            "REQ-20250129-1",
                            3,
                            4,
                            now);

            given(customerIssuanceService.getIssuanceRequest(requestId, 1L)).willReturn(response);

            // when & then
            mockMvc.perform(get("/api/customer/issuance-requests/{id}", requestId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("APPROVED"));
        }

        @Test
        @DisplayName("적립 요청 상태 조회 성공 - EXPIRED")
        void getIssuanceRequest_Success_Expired() throws Exception {
            // given
            Long requestId = 1L;
            LocalDateTime now = LocalDateTime.now();
            IssuanceRequestResponse response =
                    new IssuanceRequestResponse(
                            requestId,
                            IssuanceRequestStatus.EXPIRED,
                            now.minusSeconds(60),
                            0L,
                            "REQ-20250129-1",
                            3,
                            4,
                            now.minusSeconds(120));

            given(customerIssuanceService.getIssuanceRequest(requestId, 1L)).willReturn(response);

            // when & then
            mockMvc.perform(get("/api/customer/issuance-requests/{id}", requestId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("EXPIRED"))
                    .andExpect(jsonPath("$.remainingSeconds").value(0));
        }

        @Test
        @DisplayName("적립 요청 상태 조회 실패 - 요청 없음 (404)")
        void getIssuanceRequest_Fail_NotFound() throws Exception {
            // given
            Long requestId = 999L;

            given(customerIssuanceService.getIssuanceRequest(requestId, 1L))
                    .willThrow(new IssuanceRequestNotFoundException());

            // when & then
            mockMvc.perform(get("/api/customer/issuance-requests/{id}", requestId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("ISSUANCE_REQUEST_NOT_FOUND"));
        }

        @Test
        @DisplayName("적립 요청 상태 조회 실패 - 본인 요청이 아님 (403)")
        void getIssuanceRequest_Fail_AccessDenied() throws Exception {
            // given
            Long requestId = 1L;

            given(customerIssuanceService.getIssuanceRequest(requestId, 1L))
                    .willThrow(new BusinessException(ErrorCode.ACCESS_DENIED));

            // when & then
            mockMvc.perform(get("/api/customer/issuance-requests/{id}", requestId))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
        }
    }
}
