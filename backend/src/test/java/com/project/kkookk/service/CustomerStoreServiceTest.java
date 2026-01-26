package com.project.kkookk.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.project.kkookk.domain.stampcard.StampCard;
import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.domain.store.StoreStatus;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.controller.dto.StoreStampCardSummaryResponse;
import com.project.kkookk.repository.stampcard.StampCardRepository;
import com.project.kkookk.repository.store.StoreRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerStoreServiceTest {

    @InjectMocks private CustomerStoreService customerStoreService;

    @Mock private StoreRepository storeRepository;

    @Mock private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("매장/스탬프카드 요약 조회 성공: 활성 스탬프카드가 존재할 경우")
    void getStoreStampCardSummary_Success() {
        // given
        long storeId = 1L;
        Store mockStore = createMockStore(storeId, "테스트 매장", StoreStatus.ACTIVE);
        StampCard mockStampCard = createMockStampCard(mockStore);

        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mockStore));
        when(stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                        storeId, StampCardStatus.ACTIVE))
                .thenReturn(Optional.of(mockStampCard));

        // when
        StoreStampCardSummaryResponse response =
                customerStoreService.getStoreStampCardSummary(storeId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.storeName()).isEqualTo("테스트 매장");
        assertThat(response.stampCard()).isNotNull();
        assertThat(response.stampCard().title()).isEqualTo("테스트 스탬프카드");
    }

    @Test
    @DisplayName("매장/스탬프카드 요약 조회 성공: 활성 스탬프카드가 없을 경우 (EMPTY)")
    void getStoreStampCardSummary_Empty() {
        // given
        long storeId = 1L;
        Store mockStore = createMockStore(storeId, "테스트 매장", StoreStatus.ACTIVE);

        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mockStore));
        when(stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                        storeId, StampCardStatus.ACTIVE))
                .thenReturn(Optional.empty());

        // when
        StoreStampCardSummaryResponse response =
                customerStoreService.getStoreStampCardSummary(storeId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.storeName()).isEqualTo("테스트 매장");
        assertThat(response.stampCard()).isNull();
    }

    @Test
    @DisplayName("매장/스탬프카드 요약 조회 실패: 매장을 찾을 수 없는 경우")
    void getStoreStampCardSummary_StoreNotFound() {
        // given
        long storeId = 999L;
        when(storeRepository.findById(storeId)).thenReturn(Optional.empty());

        // when & then
        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> customerStoreService.getStoreStampCardSummary(storeId));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.STORE_NOT_FOUND);
    }

    @Test
    @DisplayName("매장/스탬프카드 요약 조회 실패: 매장이 비활성 상태인 경우")
    void getStoreStampCardSummary_StoreInactive() {
        // given
        long storeId = 1L;
        Store mockStore = createMockStore(storeId, "비활성 매장", StoreStatus.INACTIVE);
        when(storeRepository.findById(storeId)).thenReturn(Optional.of(mockStore));

        // when & then
        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> customerStoreService.getStoreStampCardSummary(storeId));

        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.STORE_INACTIVE);
    }

    // Helper methods to create mock objects
    private Store createMockStore(Long id, String name, StoreStatus status) {
        Store store = org.mockito.Mockito.mock(Store.class);
        lenient().when(store.getId()).thenReturn(id);
        lenient().when(store.getName()).thenReturn(name);
        lenient().when(store.getStatus()).thenReturn(status);
        return store;
    }

    private StampCard createMockStampCard(Store store) {
        StampCard stampCard = org.mockito.Mockito.mock(StampCard.class);
        lenient().when(stampCard.getId()).thenReturn(10L);
        lenient().when(stampCard.getTitle()).thenReturn("테스트 스탬프카드");
        lenient().when(stampCard.getRewardName()).thenReturn("아메리카노 1잔");
        lenient().when(stampCard.getGoalStampCount()).thenReturn(10);
        lenient().when(stampCard.getDesignJson()).thenReturn("{\"color\":\"blue\"}");
        return stampCard;
    }
}
