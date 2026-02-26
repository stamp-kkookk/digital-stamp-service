package com.project.kkookk.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.image.ImageStorageService;
import com.project.kkookk.store.controller.owner.dto.StoreCreateRequest;
import com.project.kkookk.store.controller.owner.dto.StoreResponse;
import com.project.kkookk.store.controller.owner.dto.StoreUpdateRequest;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreAuditLog;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreAuditLogRepository;
import com.project.kkookk.store.repository.StoreRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class StoreServiceTest {

    @InjectMocks private StoreService storeService;

    @Mock private StoreRepository storeRepository;

    @Mock private StoreAuditLogRepository storeAuditLogRepository;

    @Mock private ImageStorageService imageStorageService;

    private static final Long OWNER_ID = 1L;
    private static final Long STORE_ID = 1L;

    private Store createStore() {
        return new Store("테스트 매장", "서울시 강남구", "010-1234-5678", null, null, null, OWNER_ID);
    }

    private Store createStoreWithId() {
        Store store = new Store("테스트 매장", "서울시 강남구", "010-1234-5678", null, null, null, OWNER_ID);
        ReflectionTestUtils.setField(store, "id", STORE_ID);
        return store;
    }

    private Store createLiveStoreWithId() {
        Store store =
                new Store(
                        "라이브 매장",
                        "서울시 서초구",
                        "010-1111-2222",
                        "place-ref-1",
                        null,
                        "매장 설명",
                        OWNER_ID);
        ReflectionTestUtils.setField(store, "id", STORE_ID);
        store.transitionTo(StoreStatus.LIVE);
        return store;
    }

    @Test
    @DisplayName("매장 생성 성공 - 항상 DRAFT 상태로 생성")
    void createStore_Success() {
        // given
        StoreCreateRequest request =
                new StoreCreateRequest("테스트 매장", "서울시 강남구", "010-1234-5678", null, null);
        Store store = createStoreWithId();
        given(storeRepository.save(any(Store.class))).willReturn(store);
        given(storeAuditLogRepository.save(any(StoreAuditLog.class))).willReturn(null);

        // when
        StoreResponse response = storeService.createStore(OWNER_ID, request, null);

        // then
        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo(request.name());
        assertThat(response.status()).isEqualTo(StoreStatus.DRAFT);
        then(storeRepository).should().save(any(Store.class));
        then(storeAuditLogRepository).should().save(any(StoreAuditLog.class));
    }

    @Test
    @DisplayName("소유한 매장 목록 조회 성공 - DELETED 제외")
    void getStores_Success() {
        // given
        Store store = createStore();
        given(storeRepository.findByOwnerAccountIdAndStatusNot(OWNER_ID, StoreStatus.DELETED))
                .willReturn(List.of(store));

        // when
        List<StoreResponse> responses = storeService.getStores(OWNER_ID);

        // then
        assertThat(responses).hasSize(1);
        then(storeRepository)
                .should()
                .findByOwnerAccountIdAndStatusNot(OWNER_ID, StoreStatus.DELETED);
    }

    @Test
    @DisplayName("특정 매장 조회 성공")
    void getStore_Success() {
        // given
        Store store = createStoreWithId();
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));

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
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.empty());

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
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, anotherOwnerId))
                .willReturn(Optional.empty());

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
        StoreUpdateRequest request =
                new StoreUpdateRequest("수정된 매장", "서울시 서초구", "010-8765-4321", "카페 설명", null);
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));
        given(storeAuditLogRepository.save(any(StoreAuditLog.class))).willReturn(null);

        // when
        StoreResponse response = storeService.updateStore(OWNER_ID, STORE_ID, request, null);

        // then
        assertThat(response.name()).isEqualTo("수정된 매장");
        then(storeRepository).should().findByIdAndOwnerAccountId(STORE_ID, OWNER_ID);
    }

    @Test
    @DisplayName("LIVE 매장 description 수정 성공")
    void updateStore_Live_PartialUpdate_Success() {
        // given
        Store store = createLiveStoreWithId();
        StoreUpdateRequest request =
                new StoreUpdateRequest(
                        "라이브 매장", "서울시 서초구", "010-1111-2222", "새로운 설명", "place-ref-1");
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));
        given(storeAuditLogRepository.save(any(StoreAuditLog.class))).willReturn(null);

        // when
        StoreResponse response = storeService.updateStore(OWNER_ID, STORE_ID, request, null);

        // then
        assertThat(response.description()).isEqualTo("새로운 설명");
        assertThat(response.name()).isEqualTo("라이브 매장");
    }

    @Test
    @DisplayName("LIVE 매장 name 변경 시 실패")
    void updateStore_Live_ChangeName_Fail() {
        // given
        Store store = createLiveStoreWithId();
        StoreUpdateRequest request =
                new StoreUpdateRequest(
                        "변경된 이름", "서울시 서초구", "010-1111-2222", "매장 설명", "place-ref-1");
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));

        // when & then
        assertThatThrownBy(() -> storeService.updateStore(OWNER_ID, STORE_ID, request, null))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_UPDATE_NOT_ALLOWED);
    }

    @Test
    @DisplayName("LIVE 매장 address 변경 시 실패")
    void updateStore_Live_ChangeAddress_Fail() {
        // given
        Store store = createLiveStoreWithId();
        StoreUpdateRequest request =
                new StoreUpdateRequest(
                        "라이브 매장", "서울시 강남구 변경", "010-1111-2222", "매장 설명", "place-ref-1");
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));

        // when & then
        assertThatThrownBy(() -> storeService.updateStore(OWNER_ID, STORE_ID, request, null))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_UPDATE_NOT_ALLOWED);
    }

    @Test
    @DisplayName("LIVE 매장 phone 변경 시 실패")
    void updateStore_Live_ChangePhone_Fail() {
        // given
        Store store = createLiveStoreWithId();
        StoreUpdateRequest request =
                new StoreUpdateRequest(
                        "라이브 매장", "서울시 서초구", "010-9999-8888", "매장 설명", "place-ref-1");
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));

        // when & then
        assertThatThrownBy(() -> storeService.updateStore(OWNER_ID, STORE_ID, request, null))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_UPDATE_NOT_ALLOWED);
    }

    @Test
    @DisplayName("LIVE 매장 placeRef 변경 시 실패")
    void updateStore_Live_ChangePlaceRef_Fail() {
        // given
        Store store = createLiveStoreWithId();
        StoreUpdateRequest request =
                new StoreUpdateRequest(
                        "라이브 매장", "서울시 서초구", "010-1111-2222", "매장 설명", "new-place-ref");
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));

        // when & then
        assertThatThrownBy(() -> storeService.updateStore(OWNER_ID, STORE_ID, request, null))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_UPDATE_NOT_ALLOWED);
    }

    @Test
    @DisplayName("존재하지 않는 매장 수정 시 실패")
    void updateStore_Fail_NotFound() {
        // given
        StoreUpdateRequest request =
                new StoreUpdateRequest("수정된 매장", "서울시 서초구", "010-8765-4321", null, null);
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storeService.updateStore(OWNER_ID, STORE_ID, request, null))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
    }

    @Test
    @DisplayName("매장 삭제 성공 - soft delete (DELETED 상태로 전이)")
    void deleteStore_Success() {
        // given
        Store store = createStore();
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.of(store));
        given(storeAuditLogRepository.save(any(StoreAuditLog.class))).willReturn(null);

        // when
        storeService.deleteStore(OWNER_ID, STORE_ID);

        // then
        assertThat(store.getStatus()).isEqualTo(StoreStatus.DELETED);
        then(storeAuditLogRepository).should().save(any(StoreAuditLog.class));
    }

    @Test
    @DisplayName("존재하지 않는 매장 삭제 시 실패")
    void deleteStore_Fail_NotFound() {
        // given
        given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> storeService.deleteStore(OWNER_ID, STORE_ID))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
    }
}
