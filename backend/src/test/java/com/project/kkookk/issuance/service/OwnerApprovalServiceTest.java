package com.project.kkookk.issuance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.event.DomainEventPublisher;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.issuance.controller.dto.IssuanceApprovalResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRejectionResponse;
import com.project.kkookk.issuance.controller.dto.PendingIssuanceRequestListResponse;
import com.project.kkookk.issuance.domain.IssuanceRequest;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import com.project.kkookk.issuance.event.StampIssuedEvent;
import com.project.kkookk.issuance.repository.IssuanceRequestRepository;
import com.project.kkookk.issuance.service.exception.IssuanceAlreadyProcessedException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestExpiredException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestNotFoundException;
import com.project.kkookk.stamp.service.StampRewardService;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.domain.WalletStampCardStatus;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
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
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class OwnerApprovalServiceTest {

    @InjectMocks private OwnerApprovalService ownerApprovalService;

    @Mock private IssuanceRequestRepository issuanceRequestRepository;
    @Mock private StoreRepository storeRepository;
    @Mock private CustomerWalletRepository customerWalletRepository;
    @Mock private WalletStampCardRepository walletStampCardRepository;
    @Mock private StampCardRepository stampCardRepository;
    @Mock private StampRewardService stampRewardService;
    @Mock private DomainEventPublisher domainEventPublisher;

    private static final Long STORE_ID = 1L;
    private static final Long OWNER_ID = 10L;
    private static final Long REQUEST_ID = 100L;
    private static final Long WALLET_ID = 200L;

    private Store createStore() {
        Store store = new Store("테스트 매장", "서울시 강남구", "02-1234-5678", null, null, null, OWNER_ID);
        ReflectionTestUtils.setField(store, "id", STORE_ID);
        return store;
    }

    private IssuanceRequest createPendingRequest() {
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(STORE_ID)
                        .walletId(WALLET_ID)
                        .walletStampCardId(300L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();
        ReflectionTestUtils.setField(request, "id", REQUEST_ID);
        ReflectionTestUtils.setField(request, "createdAt", LocalDateTime.now());
        return request;
    }

    private IssuanceRequest createExpiredRequest() {
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(STORE_ID)
                        .walletId(WALLET_ID)
                        .walletStampCardId(300L)
                        .expiresAt(LocalDateTime.now().minusMinutes(1))
                        .build();
        ReflectionTestUtils.setField(request, "id", REQUEST_ID);
        ReflectionTestUtils.setField(request, "createdAt", LocalDateTime.now().minusMinutes(10));
        return request;
    }

    private CustomerWallet createWallet() {
        CustomerWallet wallet = CustomerWallet.builder().name("홍길동").phone("01012345678").build();
        ReflectionTestUtils.setField(wallet, "id", WALLET_ID);
        ReflectionTestUtils.setField(wallet, "nickname", "길동이");
        return wallet;
    }

    @Nested
    @DisplayName("승인 대기 목록 조회")
    class GetPendingRequests {

        @Test
        @DisplayName("성공 - 대기 목록 조회")
        void success() {
            // given
            Store store = createStore();
            IssuanceRequest request = createPendingRequest();
            CustomerWallet wallet = createWallet();

            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(
                            issuanceRequestRepository.findByStoreIdAndStatus(
                                    STORE_ID, IssuanceRequestStatus.PENDING))
                    .willReturn(List.of(request));
            given(customerWalletRepository.findAllByIds(Set.of(WALLET_ID)))
                    .willReturn(List.of(wallet));

            // when
            PendingIssuanceRequestListResponse response =
                    ownerApprovalService.getPendingRequests(STORE_ID, OWNER_ID);

            // then
            assertThat(response.count()).isEqualTo(1);
            assertThat(response.items()).hasSize(1);
            assertThat(response.items().get(0).customerName()).isEqualTo("홍길동");
        }

        @Test
        @DisplayName("실패 - 매장 소유권 없음")
        void fail_noOwnership() {
            // given
            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.empty());
            given(storeRepository.existsById(STORE_ID)).willReturn(true);

            // when & then
            assertThatThrownBy(() -> ownerApprovalService.getPendingRequests(STORE_ID, OWNER_ID))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            ex ->
                                    assertThat(((BusinessException) ex).getErrorCode())
                                            .isEqualTo(ErrorCode.STORE_ACCESS_DENIED));
        }

        @Test
        @DisplayName("실패 - 매장 없음")
        void fail_storeNotFound() {
            // given
            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.empty());
            given(storeRepository.existsById(STORE_ID)).willReturn(false);

            // when & then
            assertThatThrownBy(() -> ownerApprovalService.getPendingRequests(STORE_ID, OWNER_ID))
                    .isInstanceOf(StoreNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("적립 요청 승인")
    class ApproveRequest {

        @Test
        @DisplayName("성공 - 적립 승인")
        void success() {
            // given
            Store store = createStore();
            IssuanceRequest request = createPendingRequest();
            WalletStampCard walletStampCard =
                    WalletStampCard.builder()
                            .customerWalletId(WALLET_ID)
                            .storeId(STORE_ID)
                            .stampCardId(400L)
                            .build();
            ReflectionTestUtils.setField(walletStampCard, "id", 300L);
            ReflectionTestUtils.setField(walletStampCard, "stampCount", 3);

            StampCard linkedStampCard =
                    StampCard.builder().storeId(STORE_ID).title("테스트카드").goalStampCount(10).build();
            ReflectionTestUtils.setField(linkedStampCard, "id", 400L);

            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(issuanceRequestRepository.findByIdWithLock(REQUEST_ID))
                    .willReturn(Optional.of(request));
            given(
                            walletStampCardRepository
                                    .findByCustomerWalletIdAndStoreIdAndStatusWithLock(
                                            WALLET_ID, STORE_ID, WalletStampCardStatus.ACTIVE))
                    .willReturn(Optional.of(walletStampCard));
            given(stampCardRepository.findById(400L)).willReturn(Optional.of(linkedStampCard));
            given(
                            stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                    STORE_ID, StampCardStatus.ACTIVE))
                    .willReturn(Optional.of(linkedStampCard));
            given(
                            stampRewardService.processStampAccumulation(
                                    any(), any(), any(), any(Integer.class)))
                    .willReturn(
                            new StampRewardService.StampAccumulationResult(
                                    List.of(), walletStampCard));

            // when
            IssuanceApprovalResponse response =
                    ownerApprovalService.approveRequest(STORE_ID, REQUEST_ID, OWNER_ID);

            // then
            assertThat(response.id()).isEqualTo(REQUEST_ID);
            assertThat(response.status()).isEqualTo(IssuanceRequestStatus.APPROVED);
            verify(domainEventPublisher).publish(any(StampIssuedEvent.class));
        }

        @Test
        @DisplayName("실패 - 이미 처리된 요청")
        void fail_alreadyProcessed() {
            // given
            Store store = createStore();
            IssuanceRequest request = createPendingRequest();
            request.approve(0); // already approved

            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(issuanceRequestRepository.findByIdWithLock(REQUEST_ID))
                    .willReturn(Optional.of(request));

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerApprovalService.approveRequest(
                                            STORE_ID, REQUEST_ID, OWNER_ID))
                    .isInstanceOf(IssuanceAlreadyProcessedException.class);
        }

        @Test
        @DisplayName("실패 - 만료된 요청")
        void fail_expired() {
            // given
            Store store = createStore();
            IssuanceRequest request = createExpiredRequest();

            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(issuanceRequestRepository.findByIdWithLock(REQUEST_ID))
                    .willReturn(Optional.of(request));

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerApprovalService.approveRequest(
                                            STORE_ID, REQUEST_ID, OWNER_ID))
                    .isInstanceOf(IssuanceRequestExpiredException.class);
        }

        @Test
        @DisplayName("실패 - 요청 없음")
        void fail_notFound() {
            // given
            Store store = createStore();

            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(issuanceRequestRepository.findByIdWithLock(REQUEST_ID))
                    .willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(
                            () ->
                                    ownerApprovalService.approveRequest(
                                            STORE_ID, REQUEST_ID, OWNER_ID))
                    .isInstanceOf(IssuanceRequestNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("적립 요청 거절")
    class RejectRequest {

        @Test
        @DisplayName("성공 - 적립 거절")
        void success() {
            // given
            Store store = createStore();
            IssuanceRequest request = createPendingRequest();

            given(storeRepository.findByIdAndOwnerAccountId(STORE_ID, OWNER_ID))
                    .willReturn(Optional.of(store));
            given(issuanceRequestRepository.findByIdWithLock(REQUEST_ID))
                    .willReturn(Optional.of(request));

            // when
            IssuanceRejectionResponse response =
                    ownerApprovalService.rejectRequest(STORE_ID, REQUEST_ID, OWNER_ID);

            // then
            assertThat(response.id()).isEqualTo(REQUEST_ID);
            assertThat(response.status()).isEqualTo(IssuanceRequestStatus.REJECTED);
        }
    }
}
