package com.project.kkookk.migration.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.migration.controller.dto.MigrationApproveRequest;
import com.project.kkookk.migration.controller.dto.MigrationApproveResponse;
import com.project.kkookk.migration.controller.dto.MigrationDetailResponse;
import com.project.kkookk.migration.controller.dto.MigrationListResponse;
import com.project.kkookk.migration.controller.dto.MigrationRejectRequest;
import com.project.kkookk.migration.controller.dto.MigrationRejectResponse;
import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import com.project.kkookk.migration.repository.StampMigrationRequestRepository;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OwnerMigrationServiceTest {

    private static final Long OWNER_ID = 1L;

    @InjectMocks private OwnerMigrationService ownerMigrationService;

    @Mock private StampMigrationRequestRepository migrationRepository;
    @Mock private CustomerWalletRepository customerWalletRepository;
    @Mock private WalletStampCardRepository walletStampCardRepository;
    @Mock private StampCardRepository stampCardRepository;
    @Mock private StampEventRepository stampEventRepository;
    @Mock private StoreRepository storeRepository;

    @Nested
    @DisplayName("목록 조회")
    class GetList {

        @Test
        @DisplayName("SUBMITTED 상태 목록 조회 성공")
        void getList_Success() {
            // given
            Long storeId = 1L;
            Long walletId = 100L;

            StampMigrationRequest migration = createMigration(1L, walletId, storeId);
            CustomerWallet wallet = createWallet(walletId, "010-1234-5678", "홍길동");
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(
                            migrationRepository.findByStoreIdAndStatusOrderByRequestedAtDesc(
                                    storeId, StampMigrationStatus.SUBMITTED))
                    .willReturn(List.of(migration));
            given(customerWalletRepository.findAllByIds(Set.of(walletId)))
                    .willReturn(List.of(wallet));

            // when
            MigrationListResponse response = ownerMigrationService.getList(storeId, OWNER_ID);

            // then
            assertThat(response.migrations()).hasSize(1);
            assertThat(response.migrations().get(0).customerPhone()).isEqualTo("010-1234-5678");
            assertThat(response.migrations().get(0).customerName()).isEqualTo("홍길동");
            assertThat(response.migrations().get(0).status()).isEqualTo("SUBMITTED");
            assertThat(response.migrations().get(0).imageUrl()).isNull(); // 목록에서 이미지 제외
        }

        @Test
        @DisplayName("빈 목록 조회 성공")
        void getList_Success_Empty() {
            // given
            Long storeId = 1L;
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(
                            migrationRepository.findByStoreIdAndStatusOrderByRequestedAtDesc(
                                    storeId, StampMigrationStatus.SUBMITTED))
                    .willReturn(List.of());

            // when
            MigrationListResponse response = ownerMigrationService.getList(storeId, OWNER_ID);

            // then
            assertThat(response.migrations()).isEmpty();
        }
    }

    @Nested
    @DisplayName("상세 조회")
    class GetDetail {

        @Test
        @DisplayName("상세 조회 성공")
        void getDetail_Success() {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            Long walletId = 100L;

            StampMigrationRequest migration = createMigration(migrationId, walletId, storeId);
            CustomerWallet wallet = createWallet(walletId, "010-1234-5678", "홍길동");
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.of(migration));
            given(customerWalletRepository.findById(walletId)).willReturn(Optional.of(wallet));

            // when
            MigrationDetailResponse response =
                    ownerMigrationService.getDetail(storeId, migrationId, OWNER_ID);

            // then
            assertThat(response.id()).isEqualTo(migrationId);
            assertThat(response.customerPhone()).isEqualTo("010-1234-5678");
            assertThat(response.customerName()).isEqualTo("홍길동");
            assertThat(response.status()).isEqualTo("SUBMITTED");
        }

        @Test
        @DisplayName("상세 조회 실패 - 존재하지 않음")
        void getDetail_Fail_NotFound() {
            // given
            Long storeId = 1L;
            Long migrationId = 999L;
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(
                            () -> ownerMigrationService.getDetail(storeId, migrationId, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.MIGRATION_NOT_FOUND));
        }
    }

    @Nested
    @DisplayName("승인 처리")
    class Approve {

        @Test
        @DisplayName("승인 성공 - 스탬프 수 입력")
        void approve_Success_WithStampCount() {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            Long walletId = 100L;
            int approvedCount = 5;

            StampMigrationRequest migration = createMigration(migrationId, walletId, storeId);
            StampCard activeCard = createActiveStampCard(10L, storeId);
            WalletStampCard walletStampCard = createWalletStampCard(50L, walletId, storeId, 10L, 3);
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.of(migration));
            given(
                            stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                    storeId, StampCardStatus.ACTIVE))
                    .willReturn(Optional.of(activeCard));
            given(
                            walletStampCardRepository.findByCustomerWalletIdAndStoreIdWithLock(
                                    walletId, storeId))
                    .willReturn(Optional.of(walletStampCard));
            given(stampEventRepository.save(any(StampEvent.class)))
                    .willAnswer(i -> i.getArgument(0));

            MigrationApproveRequest request = new MigrationApproveRequest(approvedCount);

            // when
            MigrationApproveResponse response =
                    ownerMigrationService.approve(storeId, migrationId, request, OWNER_ID);

            // then
            assertThat(response.id()).isEqualTo(migrationId);
            assertThat(response.status()).isEqualTo("APPROVED");
            assertThat(response.approvedStampCount()).isEqualTo(approvedCount);
            assertThat(response.processedAt()).isNotNull();

            verify(stampEventRepository).save(any(StampEvent.class));
        }

        @Test
        @DisplayName("승인 실패 - WalletStampCard 없음")
        void approve_Fail_WalletStampCardNotFound() {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            Long walletId = 100L;

            StampMigrationRequest migration = createMigration(migrationId, walletId, storeId);
            StampCard activeCard = createActiveStampCard(10L, storeId);
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.of(migration));
            given(
                            stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                    storeId, StampCardStatus.ACTIVE))
                    .willReturn(Optional.of(activeCard));
            given(
                            walletStampCardRepository.findByCustomerWalletIdAndStoreIdWithLock(
                                    walletId, storeId))
                    .willReturn(Optional.empty());

            MigrationApproveRequest request = new MigrationApproveRequest(3);

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerMigrationService.approve(
                                            storeId, migrationId, request, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.WALLET_STAMP_CARD_NOT_FOUND));
        }

        @Test
        @DisplayName("승인 실패 - 이미 처리된 요청")
        void approve_Fail_AlreadyProcessed() {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            Long walletId = 100L;

            StampMigrationRequest migration = createMigration(migrationId, walletId, storeId);
            migration.approve(5); // 이미 승인됨
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.of(migration));

            MigrationApproveRequest request = new MigrationApproveRequest(3);

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerMigrationService.approve(
                                            storeId, migrationId, request, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.MIGRATION_ALREADY_PROCESSED));
        }

        @Test
        @DisplayName("승인 실패 - 활성 스탬프 카드 없음")
        void approve_Fail_NoActiveStampCard() {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            Long walletId = 100L;

            StampMigrationRequest migration = createMigration(migrationId, walletId, storeId);
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.of(migration));
            given(
                            stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                    storeId, StampCardStatus.ACTIVE))
                    .willReturn(Optional.empty());

            MigrationApproveRequest request = new MigrationApproveRequest(3);

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerMigrationService.approve(
                                            storeId, migrationId, request, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.NO_ACTIVE_STAMP_CARD));
        }

        @Test
        @DisplayName("승인 실패 - 존재하지 않는 요청")
        void approve_Fail_NotFound() {
            // given
            Long storeId = 1L;
            Long migrationId = 999L;
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.empty());

            MigrationApproveRequest request = new MigrationApproveRequest(3);

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerMigrationService.approve(
                                            storeId, migrationId, request, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.MIGRATION_NOT_FOUND));
        }
    }

    @Nested
    @DisplayName("반려 처리")
    class Reject {

        @Test
        @DisplayName("반려 성공")
        void reject_Success() {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            Long walletId = 100L;
            String rejectReason = "사진이 불명확합니다.";

            StampMigrationRequest migration = createMigration(migrationId, walletId, storeId);
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.of(migration));

            MigrationRejectRequest request = new MigrationRejectRequest(rejectReason);

            // when
            MigrationRejectResponse response =
                    ownerMigrationService.reject(storeId, migrationId, request, OWNER_ID);

            // then
            assertThat(response.id()).isEqualTo(migrationId);
            assertThat(response.status()).isEqualTo("REJECTED");
            assertThat(response.rejectReason()).isEqualTo(rejectReason);
            assertThat(response.processedAt()).isNotNull();
        }

        @Test
        @DisplayName("반려 실패 - 이미 처리된 요청")
        void reject_Fail_AlreadyProcessed() {
            // given
            Long storeId = 1L;
            Long migrationId = 1L;
            Long walletId = 100L;

            StampMigrationRequest migration = createMigration(migrationId, walletId, storeId);
            migration.reject("이전 반려 사유");
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.of(migration));

            MigrationRejectRequest request = new MigrationRejectRequest("새 반려 사유");

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerMigrationService.reject(
                                            storeId, migrationId, request, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.MIGRATION_ALREADY_PROCESSED));
        }

        @Test
        @DisplayName("반려 실패 - 존재하지 않는 요청")
        void reject_Fail_NotFound() {
            // given
            Long storeId = 1L;
            Long migrationId = 999L;
            Store store = createStore(storeId, OWNER_ID);

            given(storeRepository.findByIdAndOwnerAccountId(storeId, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(migrationRepository.findByIdAndStoreId(migrationId, storeId))
                    .willReturn(Optional.empty());

            MigrationRejectRequest request = new MigrationRejectRequest("반려 사유");

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerMigrationService.reject(
                                            storeId, migrationId, request, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.MIGRATION_NOT_FOUND));
        }
    }

    // Helper methods
    private StampMigrationRequest createMigration(Long id, Long walletId, Long storeId) {
        StampMigrationRequest migration =
                StampMigrationRequest.builder()
                        .customerWalletId(walletId)
                        .storeId(storeId)
                        .imageData("data:image/jpeg;base64,/9j/4AAQSkZJRg" + id)
                        .claimedStampCount(5)
                        .requestedAt(LocalDateTime.now())
                        .build();
        setId(migration, id);
        return migration;
    }

    private CustomerWallet createWallet(Long id, String phone, String name) {
        CustomerWallet wallet =
                CustomerWallet.builder().phone(phone).name(name).nickname(name).build();
        setId(wallet, id);
        return wallet;
    }

    private StampCard createActiveStampCard(Long id, Long storeId) {
        StampCard card =
                StampCard.builder().storeId(storeId).title("테스트 스탬프 카드").goalStampCount(10).build();
        setId(card, id);
        card.updateStatus(StampCardStatus.ACTIVE);
        return card;
    }

    private WalletStampCard createWalletStampCard(
            Long id, Long walletId, Long storeId, Long stampCardId, int stampCount) {
        WalletStampCard wsc =
                WalletStampCard.builder()
                        .customerWalletId(walletId)
                        .storeId(storeId)
                        .stampCardId(stampCardId)
                        .stampCount(stampCount)
                        .build();
        setId(wsc, id);
        return wsc;
    }

    private Store createStore(Long id, Long ownerAccountId) {
        Store store =
                new Store("테스트 매장", "서울시 강남구", "02-1234-5678", StoreStatus.ACTIVE, ownerAccountId);
        setId(store, id);
        return store;
    }

    private void setId(Object entity, Long id) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(entity, id);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Failed to set id field", e);
        }
    }
}
