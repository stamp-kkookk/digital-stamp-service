package com.project.kkookk.controller.stampcard;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.controller.stampcard.dto.CreateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.StampCardListResponse;
import com.project.kkookk.controller.stampcard.dto.StampCardResponse;
import com.project.kkookk.controller.stampcard.dto.StampCardSummary;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.service.stampcard.StampCardService;
import com.project.kkookk.service.stampcard.exception.StampCardAlreadyActiveException;
import com.project.kkookk.service.stampcard.exception.StampCardDeleteNotAllowedException;
import com.project.kkookk.service.stampcard.exception.StampCardNotFoundException;
import com.project.kkookk.service.stampcard.exception.StampCardStatusInvalidException;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
        controllers = StampCardController.class,
        excludeAutoConfiguration = {
            org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class
        })
class StampCardControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private StampCardService stampCardService;

    @Test
    @DisplayName("스탬프 카드 생성 성공")
    void createStampCard_Success() throws Exception {
        // given
        Long storeId = 1L;
        CreateStampCardRequest request =
                new CreateStampCardRequest(
                        "커피 스탬프 카드", 10, 10, "아메리카노 1잔 무료", 1, 30, "{\"theme\": \"coffee\"}");

        StampCardResponse response =
                new StampCardResponse(
                        1L,
                        "커피 스탬프 카드",
                        StampCardStatus.DRAFT,
                        10,
                        10,
                        "아메리카노 1잔 무료",
                        1,
                        30,
                        "{\"theme\": \"coffee\"}",
                        storeId,
                        LocalDateTime.now(),
                        LocalDateTime.now());

        given(stampCardService.create(eq(storeId), any(CreateStampCardRequest.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        post("/api/owner/stores/{storeId}/stamp-cards", storeId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("커피 스탬프 카드"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("스탬프 카드 생성 실패 - 카드 이름 누락")
    void createStampCard_Fail_TitleRequired() throws Exception {
        // given
        Long storeId = 1L;
        CreateStampCardRequest request =
                new CreateStampCardRequest(null, 10, 10, "리워드", 1, 30, null);

        // when & then
        mockMvc.perform(
                        post("/api/owner/stores/{storeId}/stamp-cards", storeId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    @Test
    @DisplayName("스탬프 카드 생성 실패 - 목표 스탬프 수 누락")
    void createStampCard_Fail_GoalStampCountRequired() throws Exception {
        // given
        Long storeId = 1L;
        CreateStampCardRequest request =
                new CreateStampCardRequest("카드", null, 10, "리워드", 1, 30, null);

        // when & then
        mockMvc.perform(
                        post("/api/owner/stores/{storeId}/stamp-cards", storeId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    @Test
    @DisplayName("스탬프 카드 목록 조회 성공")
    void getStampCardList_Success() throws Exception {
        // given
        Long storeId = 1L;
        StampCardSummary summary =
                new StampCardSummary(
                        1L,
                        "커피 스탬프 카드",
                        StampCardStatus.ACTIVE,
                        10,
                        "아메리카노 1잔 무료",
                        LocalDateTime.now());

        StampCardListResponse response =
                StampCardListResponse.from(new PageImpl<>(List.of(summary)));

        given(stampCardService.getList(eq(storeId), eq(null), any())).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/stamp-cards", storeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].title").value("커피 스탬프 카드"))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    @DisplayName("스탬프 카드 목록 조회 성공 - 상태 필터")
    void getStampCardList_Success_WithStatusFilter() throws Exception {
        // given
        Long storeId = 1L;
        StampCardSummary summary =
                new StampCardSummary(
                        1L,
                        "커피 스탬프 카드",
                        StampCardStatus.ACTIVE,
                        10,
                        "아메리카노 1잔 무료",
                        LocalDateTime.now());

        StampCardListResponse response =
                StampCardListResponse.from(new PageImpl<>(List.of(summary)));

        given(stampCardService.getList(eq(storeId), eq(StampCardStatus.ACTIVE), any()))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        get("/api/owner/stores/{storeId}/stamp-cards", storeId)
                                .param("status", "ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
    }

    @Test
    @DisplayName("스탬프 카드 상세 조회 성공")
    void getStampCardById_Success() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        StampCardResponse response =
                new StampCardResponse(
                        cardId,
                        "커피 스탬프 카드",
                        StampCardStatus.ACTIVE,
                        10,
                        10,
                        "아메리카노 1잔 무료",
                        1,
                        30,
                        "{\"theme\": \"coffee\"}",
                        storeId,
                        LocalDateTime.now(),
                        LocalDateTime.now());

        given(stampCardService.getById(storeId, cardId)).willReturn(response);

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/stamp-cards/{id}", storeId, cardId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(cardId))
                .andExpect(jsonPath("$.title").value("커피 스탬프 카드"));
    }

    @Test
    @DisplayName("스탬프 카드 상세 조회 실패 - 존재하지 않음")
    void getStampCardById_Fail_NotFound() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 999L;

        given(stampCardService.getById(storeId, cardId))
                .willThrow(new StampCardNotFoundException());

        // when & then
        mockMvc.perform(get("/api/owner/stores/{storeId}/stamp-cards/{id}", storeId, cardId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("STAMP_CARD_NOT_FOUND"));
    }

    @Test
    @DisplayName("스탬프 카드 수정 성공")
    void updateStampCard_Success() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest(
                        "수정된 카드 이름", 15, 15, "수정된 리워드", 2, 60, "{\"theme\": \"new\"}");

        StampCardResponse response =
                new StampCardResponse(
                        cardId,
                        "수정된 카드 이름",
                        StampCardStatus.DRAFT,
                        15,
                        15,
                        "수정된 리워드",
                        2,
                        60,
                        "{\"theme\": \"new\"}",
                        storeId,
                        LocalDateTime.now(),
                        LocalDateTime.now());

        given(stampCardService.update(eq(storeId), eq(cardId), any(UpdateStampCardRequest.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        put("/api/owner/stores/{storeId}/stamp-cards/{id}", storeId, cardId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("수정된 카드 이름"))
                .andExpect(jsonPath("$.goalStampCount").value(15));
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 성공")
    void updateStampCardStatus_Success() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        StampCardResponse response =
                new StampCardResponse(
                        cardId,
                        "커피 스탬프 카드",
                        StampCardStatus.ACTIVE,
                        10,
                        10,
                        "아메리카노 1잔 무료",
                        1,
                        30,
                        "{\"theme\": \"coffee\"}",
                        storeId,
                        LocalDateTime.now(),
                        LocalDateTime.now());

        given(
                        stampCardService.updateStatus(
                                eq(storeId), eq(cardId), any(UpdateStampCardStatusRequest.class)))
                .willReturn(response);

        // when & then
        mockMvc.perform(
                        patch(
                                        "/api/owner/stores/{storeId}/stamp-cards/{id}/status",
                                        storeId,
                                        cardId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 실패 - 유효하지 않은 상태 전이")
    void updateStampCardStatus_Fail_InvalidTransition() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        given(
                        stampCardService.updateStatus(
                                eq(storeId), eq(cardId), any(UpdateStampCardStatusRequest.class)))
                .willThrow(
                        new StampCardStatusInvalidException(
                                StampCardStatus.ARCHIVED, StampCardStatus.ACTIVE));

        // when & then
        mockMvc.perform(
                        patch(
                                        "/api/owner/stores/{storeId}/stamp-cards/{id}/status",
                                        storeId,
                                        cardId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("STAMP_CARD_STATUS_INVALID"));
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 실패 - 이미 활성화된 카드 존재")
    void updateStampCardStatus_Fail_AlreadyActive() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        given(
                        stampCardService.updateStatus(
                                eq(storeId), eq(cardId), any(UpdateStampCardStatusRequest.class)))
                .willThrow(new StampCardAlreadyActiveException());

        // when & then
        mockMvc.perform(
                        patch(
                                        "/api/owner/stores/{storeId}/stamp-cards/{id}/status",
                                        storeId,
                                        cardId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("STAMP_CARD_ALREADY_ACTIVE"));
    }

    @Test
    @DisplayName("스탬프 카드 삭제 성공")
    void deleteStampCard_Success() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 1L;

        doNothing().when(stampCardService).delete(storeId, cardId);

        // when & then
        mockMvc.perform(delete("/api/owner/stores/{storeId}/stamp-cards/{id}", storeId, cardId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("스탬프 카드 삭제 실패 - DRAFT 상태가 아님")
    void deleteStampCard_Fail_NotDraft() throws Exception {
        // given
        Long storeId = 1L;
        Long cardId = 1L;

        doThrow(new StampCardDeleteNotAllowedException())
                .when(stampCardService)
                .delete(storeId, cardId);

        // when & then
        mockMvc.perform(delete("/api/owner/stores/{storeId}/stamp-cards/{id}", storeId, cardId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("STAMP_CARD_DELETE_NOT_ALLOWED"));
    }
}
