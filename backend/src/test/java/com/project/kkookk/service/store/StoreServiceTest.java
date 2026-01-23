package com.project.kkookk.service.store;

import com.project.kkookk.controller.store.dto.StoreCreateRequest;
import com.project.kkookk.controller.store.dto.StoreResponse;
import com.project.kkookk.controller.store.dto.StoreUpdateRequest;
import com.project.kkookk.domain.store.Store;
import com.project.kkookk.domain.store.StoreStatus;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.repository.store.StoreRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class StoreServiceTest {

    @InjectMocks
    private StoreService storeService;

    @Mock
    private StoreRepository storeRepository;

    private static final Long OWNER_ID = 1L;
    private static final Long STORE_ID = 1L;

    private Store createStore() {
        return new Store("테스트 매장", "서울시 강남구", "010-1234-5678", StoreStatus.ACTIVE, OWNER_ID);
    }
    
    private Store createStoreWithId() {
        Store store = new Store("테스트 매장", "서울시 강남구", "010-1234-5678", StoreStatus.ACTIVE, OWNER_ID);
        // In a real scenario, ID is set by persistence context. Here we simulate it for testing.
        try {
            java.lang.reflect.Field idField = Store.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(store, STORE_ID);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
        }
        return store;
    }

    @Test
    @DisplayName("매장 생성 성공")
    void createStore_Success() {
        // given
        StoreCreateRequest request = new StoreCreateRequest("테스트 매장", "서울시 강남구", "010-1234-5678", StoreStatus.ACTIVE);
        Store store = createStoreWithId();
        given(storeRepository.save(any(Store.class))).willReturn(store);

        // when
        StoreResponse response = storeService.createStore(OWNER_ID, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo(request.name());
        then(storeRepository).should().save(any(Store.class));
    }

    @Test
    @DisplayName("소유한 매장 목록 조회 성공")
    void getStores_Success() {
        // given
        Store store = createStore();
        given(storeRepository.findByOwnerAccountId(OWNER_ID)).willReturn(List.of(store));

        // when
        List<StoreResponse> responses = storeService.getStores(OWNER_ID);

        // then
        assertThat(responses).hasSize(1);
        then(storeRepository).should().findByOwnerAccountId(OWNER_ID);
    }

    @Test
    @DisplayName("특정 매장 조회 성공")
    void getStore_Success() {
        // given
        Store store = createStoreWithId();
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID)).willReturn(Optional.of(store));

        // when
        StoreResponse response = storeService.getStore(OWNER_ID, STORE_ID);

        // then
        assertThat(response.id()).isEqualTo(STORE_ID);
        then(storeRepository).should().findByIdAndOwnerAccountId(STORE_ID, OWNER_ID);
    }

    @Test
    @DisplayName("존재하지 않는 매장 조회 시 실패")
    void getStore_Fail_NotFound() {
        // given
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storeService.getStore(OWNER_ID, STORE_ID))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
        then(storeRepository).should().findByIdAndOwnerAccountId(STORE_ID, OWNER_ID);
    }
    
    @Test
    @DisplayName("다른 소유자의 매장 접근 시 실패")
    void getStore_Fail_NotOwner() {
        // given
        Long anotherOwnerId = 2L;
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, anotherOwnerId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storeService.getStore(anotherOwnerId, STORE_ID))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
        
        then(storeRepository).should().findByIdAndOwnerAccountId(STORE_ID, anotherOwnerId);
    }

    @Test
    @DisplayName("매장 정보 수정 성공")
    void updateStore_Success() {
        // given
        Store store = createStore();
        StoreUpdateRequest request = new StoreUpdateRequest("수정된 매장", "서울시 서초구", "010-8765-4321", StoreStatus.INACTIVE);
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID)).willReturn(Optional.of(store));

        // when
        StoreResponse response = storeService.updateStore(OWNER_ID, STORE_ID, request);

        // then
        assertThat(response.name()).isEqualTo("수정된 매장");
        assertThat(response.status()).isEqualTo(StoreStatus.INACTIVE);
        then(storeRepository).should().findByIdAndOwnerAccountId(STORE_ID, OWNER_ID);
    }

    @Test
    @DisplayName("존재하지 않는 매장 수정 시 실패")
    void updateStore_Fail_NotFound() {
        // given
        StoreUpdateRequest request = new StoreUpdateRequest("수정된 매장", "서울시 서초구", "010-8765-4321", StoreStatus.INACTIVE);
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storeService.updateStore(OWNER_ID, STORE_ID, request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
    }


    @Test
    @DisplayName("매장 삭제 성공")
    void deleteStore_Success() {
        // given
        Store store = createStore();
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID)).willReturn(Optional.of(store));
        willDoNothing().given(storeRepository).delete(store);

        // when
        storeService.deleteStore(OWNER_ID, STORE_ID);

        // then
        then(storeRepository).should().delete(store);
    }
    
    @Test
    @DisplayName("존재하지 않는 매장 삭제 시 실패")
    void deleteStore_Fail_NotFound() {
        // given
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storeService.deleteStore(OWNER_ID, STORE_ID))
            .isInstanceOf(BusinessException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
    }
}
