package com.project.kkookk.service.stampcard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.project.kkookk.controller.stampcard.dto.CreateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.StampCardListResponse;
import com.project.kkookk.controller.stampcard.dto.StampCardResponse;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardRequest;
import com.project.kkookk.controller.stampcard.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.domain.stampcard.StampCard;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.repository.stampcard.StampCardRepository;
import com.project.kkookk.service.stampcard.exception.StampCardAlreadyActiveException;
import com.project.kkookk.service.stampcard.exception.StampCardDeleteNotAllowedException;
import com.project.kkookk.service.stampcard.exception.StampCardNotFoundException;
import com.project.kkookk.service.stampcard.exception.StampCardStatusInvalidException;
import com.project.kkookk.service.stampcard.exception.StampCardUpdateNotAllowedException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class StampCardServiceTest {

    @InjectMocks private StampCardService stampCardService;

    @Mock private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("스탬프 카드 생성 성공")
    void createStampCard_Success() {
        // given
        Long storeId = 1L;
        CreateStampCardRequest request =
                new CreateStampCardRequest(
                        "커피 스탬프 카드", 10, 10, "아메리카노 1잔 무료", 1, 30, "{\"theme\": \"coffee\"}");

        StampCard stampCard =
                StampCard.builder()
                        .storeId(storeId)
                        .title("커피 스탬프 카드")
                        .goalStampCount(10)
                        .requiredStamps(10)
                        .rewardName("아메리카노 1잔 무료")
                        .rewardQuantity(1)
                        .expireDays(30)
                        .designJson("{\"theme\": \"coffee\"}")
                        .build();

        given(stampCardRepository.save(any(StampCard.class))).willReturn(stampCard);

        // when
        StampCardResponse response = stampCardService.create(storeId, request);

        // then
        assertThat(response.title()).isEqualTo("커피 스탬프 카드");
        assertThat(response.status()).isEqualTo(StampCardStatus.DRAFT);
        assertThat(response.goalStampCount()).isEqualTo(10);
        verify(stampCardRepository).save(any(StampCard.class));
    }

    @Test
    @DisplayName("스탬프 카드 목록 조회 성공")
    void getStampCardList_Success() {
        // given
        Long storeId = 1L;
        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        Pageable pageable = PageRequest.of(0, 20);
        Page<StampCard> page = new PageImpl<>(List.of(stampCard));

        given(stampCardRepository.findByStoreId(storeId, pageable)).willReturn(page);

        // when
        StampCardListResponse response = stampCardService.getList(storeId, null, pageable);

        // then
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).title()).isEqualTo("커피 스탬프 카드");
    }

    @Test
    @DisplayName("스탬프 카드 목록 조회 성공 - 상태 필터")
    void getStampCardList_Success_WithStatusFilter() {
        // given
        Long storeId = 1L;
        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        Pageable pageable = PageRequest.of(0, 20);
        Page<StampCard> page = new PageImpl<>(List.of(stampCard));

        given(stampCardRepository.findByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE, pageable))
                .willReturn(page);

        // when
        StampCardListResponse response =
                stampCardService.getList(storeId, StampCardStatus.ACTIVE, pageable);

        // then
        assertThat(response.content()).hasSize(1);
    }

    @Test
    @DisplayName("스탬프 카드 상세 조회 성공")
    void getStampCardById_Success() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));

        // when
        StampCardResponse response = stampCardService.getById(storeId, cardId);

        // then
        assertThat(response.title()).isEqualTo("커피 스탬프 카드");
    }

    @Test
    @DisplayName("스탬프 카드 상세 조회 실패 - 존재하지 않음")
    void getStampCardById_Fail_NotFound() {
        // given
        Long storeId = 1L;
        Long cardId = 999L;

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> stampCardService.getById(storeId, cardId))
                .isInstanceOf(StampCardNotFoundException.class);
    }

    @Test
    @DisplayName("스탬프 카드 수정 성공 - DRAFT 상태 전체 수정")
    void updateStampCard_Success_DraftFullUpdate() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest(
                        "수정된 카드", 15, 15, "수정된 리워드", 2, 60, "{\"theme\": \"new\"}");

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("원본 카드").goalStampCount(10).build();

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));

        // when
        StampCardResponse response = stampCardService.update(storeId, cardId, request);

        // then
        assertThat(response.title()).isEqualTo("수정된 카드");
        assertThat(response.goalStampCount()).isEqualTo(15);
    }

    @Test
    @DisplayName("스탬프 카드 수정 성공 - ACTIVE 상태 부분 수정")
    void updateStampCard_Success_ActivePartialUpdate() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest(
                        "수정된 카드", 15, 15, "수정된 리워드", 2, 60, "{\"theme\": \"new\"}");

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("원본 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ACTIVE);

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));

        // when
        StampCardResponse response = stampCardService.update(storeId, cardId, request);

        // then
        assertThat(response.title()).isEqualTo("수정된 카드");
        assertThat(response.goalStampCount()).isEqualTo(10);
    }

    @Test
    @DisplayName("스탬프 카드 수정 실패 - ARCHIVED 상태 수정 불가")
    void updateStampCard_Fail_ArchivedNotAllowed() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest("수정", 10, 10, "리워드", 1, 30, null);

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("원본 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ARCHIVED);

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));

        // when & then
        assertThatThrownBy(() -> stampCardService.update(storeId, cardId, request))
                .isInstanceOf(StampCardUpdateNotAllowedException.class);
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 성공 - DRAFT에서 ACTIVE로")
    void updateStampCardStatus_Success_DraftToActive() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));
        given(stampCardRepository.existsByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE))
                .willReturn(false);

        // when
        StampCardResponse response = stampCardService.updateStatus(storeId, cardId, request);

        // then
        assertThat(response.status()).isEqualTo(StampCardStatus.ACTIVE);
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 실패 - 유효하지 않은 상태 전이")
    void updateStampCardStatus_Fail_InvalidTransition() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ARCHIVED);

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));

        // when & then
        assertThatThrownBy(() -> stampCardService.updateStatus(storeId, cardId, request))
                .isInstanceOf(StampCardStatusInvalidException.class);
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 실패 - 이미 활성화된 카드 존재")
    void updateStampCardStatus_Fail_AlreadyActive() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));
        given(stampCardRepository.existsByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE))
                .willReturn(true);

        // when & then
        assertThatThrownBy(() -> stampCardService.updateStatus(storeId, cardId, request))
                .isInstanceOf(StampCardAlreadyActiveException.class);
    }

    @Test
    @DisplayName("스탬프 카드 삭제 성공 - DRAFT 상태")
    void deleteStampCard_Success() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));

        // when
        stampCardService.delete(storeId, cardId);

        // then
        verify(stampCardRepository).delete(stampCard);
    }

    @Test
    @DisplayName("스탬프 카드 삭제 실패 - DRAFT 상태가 아님")
    void deleteStampCard_Fail_NotDraft() {
        // given
        Long storeId = 1L;
        Long cardId = 1L;

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("커피 스탬프 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ACTIVE);

        given(stampCardRepository.findByIdAndStoreId(cardId, storeId))
                .willReturn(Optional.of(stampCard));

        // when & then
        assertThatThrownBy(() -> stampCardService.delete(storeId, cardId))
                .isInstanceOf(StampCardDeleteNotAllowedException.class);
    }
}
