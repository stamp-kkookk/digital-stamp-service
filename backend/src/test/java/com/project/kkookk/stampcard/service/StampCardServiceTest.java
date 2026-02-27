package com.project.kkookk.stampcard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.image.ImageProcessingService;
import com.project.kkookk.stampcard.controller.dto.CreateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.StampCardListResponse;
import com.project.kkookk.stampcard.controller.dto.StampCardResponse;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardRequest;
import com.project.kkookk.stampcard.controller.dto.UpdateStampCardStatusRequest;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardDesignType;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.stampcard.service.exception.StampCardDeleteNotAllowedException;
import com.project.kkookk.stampcard.service.exception.StampCardNotFoundException;
import com.project.kkookk.stampcard.service.exception.StampCardStatusInvalidException;
import com.project.kkookk.stampcard.service.exception.StampCardUpdateNotAllowedException;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class StampCardServiceTest {

    @InjectMocks private StampCardService stampCardService;

    @Mock private StampCardRepository stampCardRepository;

    @Mock private WalletStampCardRepository walletStampCardRepository;

    @Mock private StoreRepository storeRepository;

    @Spy private ObjectMapper objectMapper = new ObjectMapper();

    @Mock private ImageProcessingService imageProcessingService;

    private static final Long OWNER_ID = 100L;
    private static final Long STORE_ID = 1L;

    @Test
    @DisplayName("스탬프 카드 생성 성공")
    void createStampCard_Success() {
        // given
        CreateStampCardRequest request =
                new CreateStampCardRequest(
                        "커피 스탬프 카드",
                        10,
                        10,
                        "아메리카노 1잔 무료",
                        1,
                        30,
                        StampCardDesignType.COLOR,
                        "{\"theme\": \"coffee\"}");

        StampCard stampCard =
                StampCard.builder()
                        .storeId(STORE_ID)
                        .title("커피 스탬프 카드")
                        .goalStampCount(10)
                        .requiredStamps(10)
                        .rewardName("아메리카노 1잔 무료")
                        .rewardQuantity(1)
                        .expireDays(30)
                        .designJson("{\"theme\": \"coffee\"}")
                        .build();

        mockStoreOwnership();
        given(stampCardRepository.save(any(StampCard.class))).willReturn(stampCard);

        // when
        StampCardResponse response =
                stampCardService.create(OWNER_ID, STORE_ID, request, null, null);

        // then
        assertThat(response.title()).isEqualTo("커피 스탬프 카드");
        assertThat(response.status()).isEqualTo(StampCardStatus.DRAFT);
        assertThat(response.goalStampCount()).isEqualTo(10);
        verify(stampCardRepository).save(any(StampCard.class));
    }

    @Test
    @DisplayName("스탬프 카드 생성 실패 - 매장 소유권 없음")
    void createStampCard_Fail_StoreAccessDenied() {
        // given
        Long otherOwnerId = 999L;
        CreateStampCardRequest request =
                new CreateStampCardRequest(
                        "커피 스탬프 카드", 10, 10, "아메리카노 1잔 무료", 1, 30, StampCardDesignType.COLOR, null);

        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, otherOwnerId))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(
                        () -> stampCardService.create(otherOwnerId, STORE_ID, request, null, null))
                .isInstanceOf(BusinessException.class)
                .satisfies(
                        e ->
                                assertThat(((BusinessException) e).getErrorCode())
                                        .isEqualTo(ErrorCode.STORE_ACCESS_DENIED));
    }

    @Test
    @DisplayName("스탬프 카드 목록 조회 성공")
    void getStampCardList_Success() {
        // given
        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("커피 스탬프 카드").goalStampCount(10).build();

        Pageable pageable = PageRequest.of(0, 20);
        Page<StampCard> page = new PageImpl<>(List.of(stampCard));

        mockStoreOwnership();
        given(stampCardRepository.findByStoreId(STORE_ID, pageable)).willReturn(page);

        // when
        StampCardListResponse response =
                stampCardService.getList(OWNER_ID, STORE_ID, null, pageable);

        // then
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).title()).isEqualTo("커피 스탬프 카드");
    }

    @Test
    @DisplayName("스탬프 카드 목록 조회 성공 - 상태 필터")
    void getStampCardList_Success_WithStatusFilter() {
        // given
        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("커피 스탬프 카드").goalStampCount(10).build();

        Pageable pageable = PageRequest.of(0, 20);
        Page<StampCard> page = new PageImpl<>(List.of(stampCard));

        mockStoreOwnership();
        given(
                        stampCardRepository.findByStoreIdAndStatus(
                                STORE_ID, StampCardStatus.ACTIVE, pageable))
                .willReturn(page);

        // when
        StampCardListResponse response =
                stampCardService.getList(OWNER_ID, STORE_ID, StampCardStatus.ACTIVE, pageable);

        // then
        assertThat(response.content()).hasSize(1);
    }

    @Test
    @DisplayName("스탬프 카드 상세 조회 성공")
    void getStampCardById_Success() {
        // given
        Long cardId = 1L;
        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("커피 스탬프 카드").goalStampCount(10).build();

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(false);

        // when
        StampCardResponse response = stampCardService.getById(OWNER_ID, STORE_ID, cardId);

        // then
        assertThat(response.title()).isEqualTo("커피 스탬프 카드");
        assertThat(response.issued()).isFalse();
    }

    @Test
    @DisplayName("스탬프 카드 상세 조회 실패 - 존재하지 않음")
    void getStampCardById_Fail_NotFound() {
        // given
        Long cardId = 999L;

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> stampCardService.getById(OWNER_ID, STORE_ID, cardId))
                .isInstanceOf(StampCardNotFoundException.class);
    }

    @Test
    @DisplayName("스탬프 카드 수정 성공 - DRAFT 상태 전체 수정")
    void updateStampCard_Success_DraftFullUpdate() {
        // given
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest(
                        "수정된 카드",
                        15,
                        15,
                        "수정된 리워드",
                        2,
                        60,
                        StampCardDesignType.IMAGE,
                        "{\"theme\": \"new\"}");

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("원본 카드").goalStampCount(10).build();

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(false);

        // when
        StampCardResponse response =
                stampCardService.update(OWNER_ID, STORE_ID, cardId, request, null, null);

        // then
        assertThat(response.title()).isEqualTo("수정된 카드");
        assertThat(response.goalStampCount()).isEqualTo(15);
    }

    @Test
    @DisplayName("스탬프 카드 수정 성공 - ACTIVE 상태 미발급 전체 수정")
    void updateStampCard_Success_ActiveNotIssuedFullUpdate() {
        // given
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest(
                        "수정된 카드",
                        15,
                        15,
                        "수정된 리워드",
                        2,
                        60,
                        StampCardDesignType.IMAGE,
                        "{\"theme\": \"new\"}");

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("원본 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ACTIVE);

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(false);

        // when
        StampCardResponse response =
                stampCardService.update(OWNER_ID, STORE_ID, cardId, request, null, null);

        // then
        assertThat(response.title()).isEqualTo("수정된 카드");
        assertThat(response.goalStampCount()).isEqualTo(15);
    }

    @Test
    @DisplayName("스탬프 카드 수정 실패 - 발급된 카드 수정 불가")
    void updateStampCard_Fail_IssuedNotAllowed() {
        // given
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest(
                        "수정된 카드", 15, 15, "수정된 리워드", 2, 60, StampCardDesignType.IMAGE, null);

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("원본 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ACTIVE);

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(true);

        // when & then
        assertThatThrownBy(
                        () ->
                                stampCardService.update(
                                        OWNER_ID, STORE_ID, cardId, request, null, null))
                .isInstanceOf(StampCardUpdateNotAllowedException.class);
    }

    @Test
    @DisplayName("스탬프 카드 수정 성공 - ARCHIVED 상태 미발급 전체 수정")
    void updateStampCard_Success_ArchivedNotIssuedFullUpdate() {
        // given
        Long cardId = 1L;
        UpdateStampCardRequest request =
                new UpdateStampCardRequest(
                        "수정된 카드", 15, 15, "수정된 리워드", 2, 60, StampCardDesignType.COLOR, null);

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("원본 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ARCHIVED);

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(false);

        // when
        StampCardResponse response =
                stampCardService.update(OWNER_ID, STORE_ID, cardId, request, null, null);

        // then
        assertThat(response.title()).isEqualTo("수정된 카드");
        assertThat(response.goalStampCount()).isEqualTo(15);
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 성공 - DRAFT에서 ACTIVE로")
    void updateStampCardStatus_Success_DraftToActive() {
        // given
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("커피 스탬프 카드").goalStampCount(10).build();

        mockStoreOwnershipWithLock();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(stampCardRepository.findByStoreIdAndStatusWithLock(STORE_ID, StampCardStatus.ACTIVE))
                .willReturn(Optional.empty());
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(false);

        // when
        StampCardResponse response =
                stampCardService.updateStatus(OWNER_ID, STORE_ID, cardId, request);

        // then
        assertThat(response.status()).isEqualTo(StampCardStatus.ACTIVE);
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 성공 - ARCHIVED에서 ACTIVE로 (기존 ACTIVE 자동 보관)")
    void updateStampCardStatus_Success_ArchivedToActiveAutoArchive() {
        // given
        Long cardId = 2L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.ACTIVE);

        StampCard existingActive =
                StampCard.builder().storeId(STORE_ID).title("기존 활성 카드").goalStampCount(10).build();
        existingActive.updateStatus(StampCardStatus.ACTIVE);

        StampCard archivedCard =
                StampCard.builder().storeId(STORE_ID).title("보관된 카드").goalStampCount(8).build();
        archivedCard.updateStatus(StampCardStatus.ARCHIVED);

        mockStoreOwnershipWithLock();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(archivedCard));
        given(stampCardRepository.findByStoreIdAndStatusWithLock(STORE_ID, StampCardStatus.ACTIVE))
                .willReturn(Optional.of(existingActive));
        given(walletStampCardRepository.existsByStampCardId(archivedCard.getId()))
                .willReturn(false);

        // when
        StampCardResponse response =
                stampCardService.updateStatus(OWNER_ID, STORE_ID, cardId, request);

        // then
        assertThat(response.status()).isEqualTo(StampCardStatus.ACTIVE);
        assertThat(existingActive.getStatus()).isEqualTo(StampCardStatus.ARCHIVED);
    }

    @Test
    @DisplayName("스탬프 카드 상태 변경 실패 - 유효하지 않은 상태 전이 (ACTIVE에서 DRAFT)")
    void updateStampCardStatus_Fail_InvalidTransition() {
        // given
        Long cardId = 1L;
        UpdateStampCardStatusRequest request =
                new UpdateStampCardStatusRequest(StampCardStatus.DRAFT);

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("커피 스탬프 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ACTIVE);

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));

        // when & then
        assertThatThrownBy(() -> stampCardService.updateStatus(OWNER_ID, STORE_ID, cardId, request))
                .isInstanceOf(StampCardStatusInvalidException.class);
    }

    @Test
    @DisplayName("스탬프 카드 삭제 성공 - 미발급 카드")
    void deleteStampCard_Success_NotIssued() {
        // given
        Long cardId = 1L;

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("커피 스탬프 카드").goalStampCount(10).build();

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(false);

        // when
        stampCardService.delete(OWNER_ID, STORE_ID, cardId);

        // then
        verify(stampCardRepository).delete(stampCard);
    }

    @Test
    @DisplayName("스탬프 카드 삭제 실패 - 발급된 카드")
    void deleteStampCard_Fail_Issued() {
        // given
        Long cardId = 1L;

        StampCard stampCard =
                StampCard.builder().storeId(STORE_ID).title("커피 스탬프 카드").goalStampCount(10).build();
        stampCard.updateStatus(StampCardStatus.ACTIVE);

        mockStoreOwnership();
        given(stampCardRepository.findByIdAndStoreId(cardId, STORE_ID))
                .willReturn(Optional.of(stampCard));
        given(walletStampCardRepository.existsByStampCardId(stampCard.getId())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> stampCardService.delete(OWNER_ID, STORE_ID, cardId))
                .isInstanceOf(StampCardDeleteNotAllowedException.class);
    }

    private void mockStoreOwnership() {
        Store store = new Store("테스트 매장", "서울시", "010-1234-5678", null, null, null, OWNER_ID);
        ReflectionTestUtils.setField(store, "id", STORE_ID);
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));
    }

    private void mockStoreOwnershipWithLock() {
        Store store = new Store("테스트 매장", "서울시", "010-1234-5678", null, null, null, OWNER_ID);
        ReflectionTestUtils.setField(store, "id", STORE_ID);
        given(storeRepository.findByIdAndOwnerAccountIdWithLock(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));
    }
}
