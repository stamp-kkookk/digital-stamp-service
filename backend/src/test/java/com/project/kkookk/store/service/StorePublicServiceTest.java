package com.project.kkookk.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.dto.response.StorePublicInfoResponse;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreInactiveException;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("StorePublicService 테스트")
class StorePublicServiceTest {

    @InjectMocks private StorePublicService storePublicService;

    @Mock private StoreRepository storeRepository;

    @Mock private StampCardRepository stampCardRepository;

    @Test
    @DisplayName("매장 공개 정보 조회 성공")
    void getStorePublicInfo_Success() {
        // given
        Long storeId = 1L;
        Store store = new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", StoreStatus.ACTIVE, 1L);
        ReflectionTestUtils.setField(store, "id", storeId);

        given(storeRepository.findById(storeId)).willReturn(Optional.of(store));
        given(stampCardRepository.countByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE))
                .willReturn(3);

        // when
        StorePublicInfoResponse response = storePublicService.getStorePublicInfo(storeId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.storeId()).isEqualTo(storeId);
        assertThat(response.storeName()).isEqualTo("꾹꾹 카페");
        assertThat(response.activeStampCardCount()).isEqualTo(3);

        verify(storeRepository).findById(storeId);
        verify(stampCardRepository).countByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);
    }

    @Test
    @DisplayName("매장 공개 정보 조회 실패 - 매장 없음")
    void getStorePublicInfo_Fail_StoreNotFound() {
        // given
        Long storeId = 999L;

        given(storeRepository.findById(storeId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storePublicService.getStorePublicInfo(storeId))
                .isInstanceOf(StoreNotFoundException.class)
                .hasMessageContaining("매장을 찾을 수 없습니다");

        verify(storeRepository).findById(storeId);
    }

    @Test
    @DisplayName("매장 공개 정보 조회 실패 - 비활성 매장")
    void getStorePublicInfo_Fail_StoreInactive() {
        // given
        Long storeId = 1L;
        Store inactiveStore =
                new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", StoreStatus.INACTIVE, 1L);
        ReflectionTestUtils.setField(inactiveStore, "id", storeId);

        given(storeRepository.findById(storeId)).willReturn(Optional.of(inactiveStore));

        // when & then
        assertThatThrownBy(() -> storePublicService.getStorePublicInfo(storeId))
                .isInstanceOf(StoreInactiveException.class)
                .hasMessageContaining("해당 매장은 현재 이용할 수 없습니다");

        verify(storeRepository).findById(storeId);
    }

    @Test
    @DisplayName("매장 공개 정보 조회 - 활성 스탬프카드 0개")
    void getStorePublicInfo_ZeroActiveCards() {
        // given
        Long storeId = 1L;
        Store store = new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", StoreStatus.ACTIVE, 1L);
        ReflectionTestUtils.setField(store, "id", storeId);

        given(storeRepository.findById(storeId)).willReturn(Optional.of(store));
        given(stampCardRepository.countByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE))
                .willReturn(0);

        // when
        StorePublicInfoResponse response = storePublicService.getStorePublicInfo(storeId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.activeStampCardCount()).isEqualTo(0);

        verify(storeRepository).findById(storeId);
        verify(stampCardRepository).countByStoreIdAndStatus(storeId, StampCardStatus.ACTIVE);
    }
}
