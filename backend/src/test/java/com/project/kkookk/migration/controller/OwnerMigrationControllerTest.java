package com.project.kkookk.migration.controller;

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
import com.project.kkookk.migration.controller.dto.MigrationApproveRequest;
import com.project.kkookk.migration.controller.dto.MigrationApproveResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse.MigrationSummary;
import com.project.kkookk.migration.controller.dto.MigrationRejectRequest;
import com.project.kkookk.migration.controller.dto.MigrationRejectResponse;
import com.project.kkookk.migration.service.OwnerMigrationService;
import com.project.kkookk.owner.controller.config.TestSecurityConfig;
import com.project.kkookk.owner.controller.config.WithMockOwner;
import java.time.LocalDateTime;
import java.util.List;
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
        controllers = OwnerMigrationController.class,
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class
        })
@Import(TestSecurityConfig.class)
@WithMockOwner(ownerId = 1L, email = "owner@example.com")
class OwnerMigrationControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @Autowired private WebApplicationContext context;

    @MockitoBean private OwnerMigrationService ownerMigrationService;

    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @Nested
    @DisplayName("GET /api/owner/stores/{storeId}/migrations")
    class GetList {

        @Test
        @DisplayName("목록 조회 성공")
        void getList_Success() throws Exception {
            // given
            Long storeId = 1L;
            LocalDateTime requestedAt = LocalDateTime.now();

            MigrationSummary summary =
                    new MigrationSummary(
                            1L,
                            "010-1234-5678",
                            "홍길동",
                            5,
                            "SUBMITTED",
                            requestedAt);

            MigrationListResponse response = new MigrationListResponse(List.of(summary));

            given(ownerMigrationService.getList(eq(storeId), any(Long.class))).willReturn(response);

            // when & then
            mockMvc.perform(get("/api/owner/stores/{storeId}/migrations", storeId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.migrations[0].id").value(1))
                    .andExpect(jsonPath("$.migrations[0].customerPhone").value("010-1234-5678"))
                    .andExpect(jsonPath("$.migrations[0].customerName").value("홍길동"))
                    .andExpect(jsonPath("$.migrations[0].claimedStampCount").value(5))
                    .andExpect(jsonPath("$.migrations[0].status").value("SUBMITTED"));
        }

        @Test
        @DisplayName("빈 목록 조회 성공")
        void getList_Success_Empty() throws Exception {
            // given
            Long storeId = 1L;
            MigrationListResponse response = new MigrationListResponse(List.of());

            given(ownerMigrationService.getList(eq(storeId), any(Long.class))).willReturn(response);

            // when & then
            mockMvc.perform(get("/api/owner/stores/{storeId}/migrations", storeId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.migrations").isEmpty());
        }
    }

    @Nested
    @DisplayName("GET /api/owner/stores/{storeId}/migrations/{id}")
    class GetDetail {

        @Test
        @DisplayName("상세 조회 성공")
        void getDetail_Success() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            LocalDateTime requestedAt = LocalDateTime.now();

            MigrationDetailResponse response =
                    new MigrationDetailResponse(
                            migrationId,
                            100L,
                            "010-1234-5678",
                            "홍길동",
                            "https://storage.example.com/1.jpg",
                            5,
                            "SUBMITTED",
                            null,
                            null,
                            requestedAt,
                            null);

            given(ownerMigrationService.getDetail(eq(storeId), eq(migrationId), any(Long.class)))
                    .willReturn(response);

            // when & then
            mockMvc.perform(
                            get(
                                    "/api/owner/stores/{storeId}/migrations/{id}",
                                    storeId,
                                    migrationId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(migrationId))
                    .andExpect(jsonPath("$.customerPhone").value("010-1234-5678"))
                    .andExpect(jsonPath("$.claimedStampCount").value(5))
                    .andExpect(jsonPath("$.status").value("SUBMITTED"));
        }

        @Test
        @DisplayName("상세 조회 실패 - 존재하지 않음")
        void getDetail_Fail_NotFound() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 999L;

            given(ownerMigrationService.getDetail(eq(storeId), eq(migrationId), any(Long.class)))
                    .willThrow(new BusinessException(ErrorCode.MIGRATION_NOT_FOUND));

            // when & then
            mockMvc.perform(
                            get(
                                    "/api/owner/stores/{storeId}/migrations/{id}",
                                    storeId,
                                    migrationId))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.code").value("MIGRATION_NOT_FOUND"));
        }
    }

    @Nested
    @DisplayName("POST /api/owner/stores/{storeId}/migrations/{id}/approve")
    class Approve {

        @Test
        @DisplayName("승인 성공")
        void approve_Success() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            int approvedStampCount = 5;
            LocalDateTime processedAt = LocalDateTime.now();

            MigrationApproveRequest request = new MigrationApproveRequest(approvedStampCount);
            MigrationApproveResponse response =
                    new MigrationApproveResponse(
                            migrationId, "APPROVED", approvedStampCount, processedAt);

            given(
                            ownerMigrationService.approve(
                                    eq(storeId),
                                    eq(migrationId),
                                    any(MigrationApproveRequest.class),
                                    any(Long.class)))
                    .willReturn(response);

            // when & then
            mockMvc.perform(
                            post(
                                            "/api/owner/stores/{storeId}/migrations/{id}/approve",
                                            storeId,
                                            migrationId)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(migrationId))
                    .andExpect(jsonPath("$.status").value("APPROVED"))
                    .andExpect(jsonPath("$.approvedStampCount").value(approvedStampCount));
        }

        @Test
        @DisplayName("승인 실패 - 스탬프 수 0 이하")
        void approve_Fail_InvalidStampCount() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            MigrationApproveRequest request = new MigrationApproveRequest(0);

            // when & then
            mockMvc.perform(
                            post(
                                            "/api/owner/stores/{storeId}/migrations/{id}/approve",
                                            storeId,
                                            migrationId)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
        }

        @Test
        @DisplayName("승인 실패 - 이미 처리된 요청")
        void approve_Fail_AlreadyProcessed() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            MigrationApproveRequest request = new MigrationApproveRequest(5);

            given(
                            ownerMigrationService.approve(
                                    eq(storeId),
                                    eq(migrationId),
                                    any(MigrationApproveRequest.class),
                                    any(Long.class)))
                    .willThrow(new BusinessException(ErrorCode.MIGRATION_ALREADY_PROCESSED));

            // when & then
            mockMvc.perform(
                            post(
                                            "/api/owner/stores/{storeId}/migrations/{id}/approve",
                                            storeId,
                                            migrationId)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("MIGRATION_ALREADY_PROCESSED"));
        }

        @Test
        @DisplayName("승인 실패 - 활성 스탬프 카드 없음")
        void approve_Fail_NoActiveStampCard() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            MigrationApproveRequest request = new MigrationApproveRequest(5);

            given(
                            ownerMigrationService.approve(
                                    eq(storeId),
                                    eq(migrationId),
                                    any(MigrationApproveRequest.class),
                                    any(Long.class)))
                    .willThrow(new BusinessException(ErrorCode.NO_ACTIVE_STAMP_CARD));

            // when & then
            mockMvc.perform(
                            post(
                                            "/api/owner/stores/{storeId}/migrations/{id}/approve",
                                            storeId,
                                            migrationId)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("NO_ACTIVE_STAMP_CARD"));
        }
    }

    @Nested
    @DisplayName("POST /api/owner/stores/{storeId}/migrations/{id}/reject")
    class Reject {

        @Test
        @DisplayName("반려 성공")
        void reject_Success() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            String rejectReason = "사진이 불명확합니다.";
            LocalDateTime processedAt = LocalDateTime.now();

            MigrationRejectRequest request = new MigrationRejectRequest(rejectReason);
            MigrationRejectResponse response =
                    new MigrationRejectResponse(migrationId, "REJECTED", rejectReason, processedAt);

            given(
                            ownerMigrationService.reject(
                                    eq(storeId),
                                    eq(migrationId),
                                    any(MigrationRejectRequest.class),
                                    any(Long.class)))
                    .willReturn(response);

            // when & then
            mockMvc.perform(
                            post(
                                            "/api/owner/stores/{storeId}/migrations/{id}/reject",
                                            storeId,
                                            migrationId)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(migrationId))
                    .andExpect(jsonPath("$.status").value("REJECTED"))
                    .andExpect(jsonPath("$.rejectReason").value(rejectReason));
        }

        @Test
        @DisplayName("반려 실패 - 반려 사유 누락")
        void reject_Fail_ReasonRequired() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            MigrationRejectRequest request = new MigrationRejectRequest("");

            // when & then
            mockMvc.perform(
                            post(
                                            "/api/owner/stores/{storeId}/migrations/{id}/reject",
                                            storeId,
                                            migrationId)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_INPUT_VALUE"));
        }

        @Test
        @DisplayName("반려 실패 - 이미 처리된 요청")
        void reject_Fail_AlreadyProcessed() throws Exception {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            MigrationRejectRequest request = new MigrationRejectRequest("반려 사유");

            given(
                            ownerMigrationService.reject(
                                    eq(storeId),
                                    eq(migrationId),
                                    any(MigrationRejectRequest.class),
                                    any(Long.class)))
                    .willThrow(new BusinessException(ErrorCode.MIGRATION_ALREADY_PROCESSED));

            // when & then
            mockMvc.perform(
                            post(
                                            "/api/owner/stores/{storeId}/migrations/{id}/reject",
                                            storeId,
                                            migrationId)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("MIGRATION_ALREADY_PROCESSED"));
        }
    }
}
