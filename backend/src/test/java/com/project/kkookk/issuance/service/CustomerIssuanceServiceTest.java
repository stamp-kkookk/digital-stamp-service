package com.project.kkookk.issuance.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.issuance.controller.dto.CreateIssuanceRequest;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResponse;
import com.project.kkookk.issuance.controller.dto.IssuanceRequestResult;
import com.project.kkookk.issuance.domain.IssuanceRequest;
import com.project.kkookk.issuance.domain.IssuanceRequestStatus;
import com.project.kkookk.issuance.repository.IssuanceRequestRepository;
import com.project.kkookk.issuance.service.exception.IssuanceRequestAlreadyPendingException;
import com.project.kkookk.issuance.service.exception.IssuanceRequestNotFoundException;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CustomerIssuanceServiceTest {

    @InjectMocks private CustomerIssuanceService customerIssuanceService;

    @Mock private IssuanceRequestRepository issuanceRequestRepository;

    @Mock private WalletStampCardRepository walletStampCardRepository;

    @Mock private StoreRepository storeRepository;

    @Nested
    @DisplayName("createIssuanceRequest")
    class CreateIssuanceRequestTest {

        @Test
        @DisplayName("적립 요청 생성 성공 - 신규 생성")
        void createIssuanceRequest_Success_NewRequest() {
            // given
            Long walletId = 1L;
            Long storeId = 1L;
            Long walletStampCardId = 10L;
            String idempotencyKey = "test-key";

            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(storeId, walletStampCardId, idempotencyKey);

            WalletStampCard walletStampCard = createWalletStampCard(walletStampCardId, walletId, storeId, 3);

            given(storeRepository.existsById(storeId)).willReturn(true);
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));
            given(issuanceRequestRepository.findByWalletIdAndIdempotencyKey(walletId, idempotencyKey))
                    .willReturn(Optional.empty());
            given(
                            issuanceRequestRepository.existsByWalletStampCardIdAndStatus(
                                    walletStampCardId, IssuanceRequestStatus.PENDING))
                    .willReturn(false);

            given(issuanceRequestRepository.save(any(IssuanceRequest.class)))
                    .willAnswer(
                            invocation -> {
                                IssuanceRequest savedRequest = invocation.getArgument(0);
                                ReflectionTestUtils.setField(savedRequest, "id", 1L);
                                ReflectionTestUtils.setField(savedRequest, "createdAt", LocalDateTime.now());
                                return savedRequest;
                            });

            // when
            IssuanceRequestResult result = customerIssuanceService.createIssuanceRequest(walletId, request);

            // then
            assertThat(result.newlyCreated()).isTrue();
            assertThat(result.response().status()).isEqualTo(IssuanceRequestStatus.PENDING);
            assertThat(result.response().currentStampCount()).isEqualTo(3);
            assertThat(result.response().afterStampCount()).isEqualTo(4);
            verify(issuanceRequestRepository).save(any(IssuanceRequest.class));
        }

        @Test
        @DisplayName("적립 요청 생성 성공 - 멱등성으로 기존 요청 반환")
        void createIssuanceRequest_Success_Idempotent() {
            // given
            Long walletId = 1L;
            Long storeId = 1L;
            Long walletStampCardId = 10L;
            String idempotencyKey = "test-key";

            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(storeId, walletStampCardId, idempotencyKey);

            WalletStampCard walletStampCard = createWalletStampCard(walletStampCardId, walletId, storeId, 3);
            IssuanceRequest existingRequest =
                    createIssuanceRequest(1L, storeId, walletId, walletStampCardId);

            given(storeRepository.existsById(storeId)).willReturn(true);
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));
            given(issuanceRequestRepository.findByWalletIdAndIdempotencyKey(walletId, idempotencyKey))
                    .willReturn(Optional.of(existingRequest));

            // when
            IssuanceRequestResult result = customerIssuanceService.createIssuanceRequest(walletId, request);

            // then
            assertThat(result.newlyCreated()).isFalse();
            assertThat(result.response().id()).isEqualTo(1L);
            verify(issuanceRequestRepository, never()).save(any());
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 매장 없음")
        void createIssuanceRequest_Fail_StoreNotFound() {
            // given
            Long walletId = 1L;
            Long storeId = 999L;

            CreateIssuanceRequest request = new CreateIssuanceRequest(storeId, 10L, "test-key");

            given(storeRepository.existsById(storeId)).willReturn(false);

            // when & then
            assertThatThrownBy(() -> customerIssuanceService.createIssuanceRequest(walletId, request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            e -> assertThat(((BusinessException) e).getErrorCode())
                                    .isEqualTo(ErrorCode.STORE_NOT_FOUND));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 지갑 스탬프카드 없음")
        void createIssuanceRequest_Fail_WalletStampCardNotFound() {
            // given
            Long walletId = 1L;
            Long storeId = 1L;
            Long walletStampCardId = 999L;

            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(storeId, walletStampCardId, "test-key");

            given(storeRepository.existsById(storeId)).willReturn(true);
            given(walletStampCardRepository.findById(walletStampCardId)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> customerIssuanceService.createIssuanceRequest(walletId, request))
                    .isInstanceOf(WalletStampCardNotFoundException.class);
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 본인 지갑이 아님")
        void createIssuanceRequest_Fail_AccessDenied() {
            // given
            Long walletId = 1L;
            Long otherWalletId = 2L;
            Long storeId = 1L;
            Long walletStampCardId = 10L;

            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(storeId, walletStampCardId, "test-key");

            WalletStampCard walletStampCard =
                    createWalletStampCard(walletStampCardId, otherWalletId, storeId, 3);

            given(storeRepository.existsById(storeId)).willReturn(true);
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));

            // when & then
            assertThatThrownBy(() -> customerIssuanceService.createIssuanceRequest(walletId, request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            e -> assertThat(((BusinessException) e).getErrorCode())
                                    .isEqualTo(ErrorCode.ACCESS_DENIED));
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - 이미 PENDING 요청 존재")
        void createIssuanceRequest_Fail_AlreadyPending() {
            // given
            Long walletId = 1L;
            Long storeId = 1L;
            Long walletStampCardId = 10L;

            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(storeId, walletStampCardId, "new-key");

            WalletStampCard walletStampCard = createWalletStampCard(walletStampCardId, walletId, storeId, 3);

            given(storeRepository.existsById(storeId)).willReturn(true);
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));
            given(issuanceRequestRepository.findByWalletIdAndIdempotencyKey(walletId, "new-key"))
                    .willReturn(Optional.empty());
            given(
                            issuanceRequestRepository.existsByWalletStampCardIdAndStatus(
                                    walletStampCardId, IssuanceRequestStatus.PENDING))
                    .willReturn(true);

            // when & then
            assertThatThrownBy(() -> customerIssuanceService.createIssuanceRequest(walletId, request))
                    .isInstanceOf(IssuanceRequestAlreadyPendingException.class);
        }

        @Test
        @DisplayName("적립 요청 생성 실패 - DB Constraint 위반 (동시 요청)")
        void createIssuanceRequest_Fail_ConcurrentRequest() {
            // given
            Long walletId = 1L;
            Long storeId = 1L;
            Long walletStampCardId = 10L;

            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(storeId, walletStampCardId, "test-key");

            WalletStampCard walletStampCard = createWalletStampCard(walletStampCardId, walletId, storeId, 3);

            given(storeRepository.existsById(storeId)).willReturn(true);
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));
            given(issuanceRequestRepository.findByWalletIdAndIdempotencyKey(walletId, "test-key"))
                    .willReturn(Optional.empty());
            given(
                            issuanceRequestRepository.existsByWalletStampCardIdAndStatus(
                                    walletStampCardId, IssuanceRequestStatus.PENDING))
                    .willReturn(false);
            given(issuanceRequestRepository.save(any(IssuanceRequest.class)))
                    .willThrow(new DataIntegrityViolationException("Unique constraint violation"));

            // when & then
            assertThatThrownBy(() -> customerIssuanceService.createIssuanceRequest(walletId, request))
                    .isInstanceOf(IssuanceRequestAlreadyPendingException.class);
        }

        @Test
        @DisplayName("적립 요청 생성 성공 - EXPIRED 요청 있으면 새로 생성")
        void createIssuanceRequest_Success_ExpiredRequestExists() {
            // given
            Long walletId = 1L;
            Long storeId = 1L;
            Long walletStampCardId = 10L;
            String idempotencyKey = "test-key";

            CreateIssuanceRequest request =
                    new CreateIssuanceRequest(storeId, walletStampCardId, idempotencyKey);

            WalletStampCard walletStampCard = createWalletStampCard(walletStampCardId, walletId, storeId, 3);
            IssuanceRequest expiredRequest =
                    createExpiredIssuanceRequest(1L, storeId, walletId, walletStampCardId);

            given(storeRepository.existsById(storeId)).willReturn(true);
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));
            given(issuanceRequestRepository.findByWalletIdAndIdempotencyKey(walletId, idempotencyKey))
                    .willReturn(Optional.of(expiredRequest));
            given(
                            issuanceRequestRepository.existsByWalletStampCardIdAndStatus(
                                    walletStampCardId, IssuanceRequestStatus.PENDING))
                    .willReturn(false);

            given(issuanceRequestRepository.save(any(IssuanceRequest.class)))
                    .willAnswer(
                            invocation -> {
                                IssuanceRequest savedRequest = invocation.getArgument(0);
                                ReflectionTestUtils.setField(savedRequest, "id", 2L);
                                ReflectionTestUtils.setField(savedRequest, "createdAt", LocalDateTime.now());
                                return savedRequest;
                            });

            // when
            IssuanceRequestResult result = customerIssuanceService.createIssuanceRequest(walletId, request);

            // then
            assertThat(result.newlyCreated()).isTrue();
            verify(issuanceRequestRepository).save(any(IssuanceRequest.class));
        }
    }

    @Nested
    @DisplayName("getIssuanceRequest")
    class GetIssuanceRequestTest {

        @Test
        @DisplayName("적립 요청 상태 조회 성공 - PENDING")
        void getIssuanceRequest_Success_Pending() {
            // given
            Long requestId = 1L;
            Long walletId = 1L;
            Long walletStampCardId = 10L;

            IssuanceRequest request = createIssuanceRequest(requestId, 1L, walletId, walletStampCardId);
            WalletStampCard walletStampCard = createWalletStampCard(walletStampCardId, walletId, 1L, 3);

            given(issuanceRequestRepository.findById(requestId)).willReturn(Optional.of(request));
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));

            // when
            IssuanceRequestResponse response =
                    customerIssuanceService.getIssuanceRequest(requestId, walletId);

            // then
            assertThat(response.id()).isEqualTo(requestId);
            assertThat(response.status()).isEqualTo(IssuanceRequestStatus.PENDING);
            assertThat(response.currentStampCount()).isEqualTo(3);
        }

        @Test
        @DisplayName("적립 요청 상태 조회 실패 - 요청 없음")
        void getIssuanceRequest_Fail_NotFound() {
            // given
            Long requestId = 999L;
            Long walletId = 1L;

            given(issuanceRequestRepository.findById(requestId)).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> customerIssuanceService.getIssuanceRequest(requestId, walletId))
                    .isInstanceOf(IssuanceRequestNotFoundException.class);
        }

        @Test
        @DisplayName("적립 요청 상태 조회 실패 - 본인 요청이 아님")
        void getIssuanceRequest_Fail_AccessDenied() {
            // given
            Long requestId = 1L;
            Long walletId = 1L;
            Long otherWalletId = 2L;

            IssuanceRequest request = createIssuanceRequest(requestId, 1L, otherWalletId, 10L);

            given(issuanceRequestRepository.findById(requestId)).willReturn(Optional.of(request));

            // when & then
            assertThatThrownBy(() -> customerIssuanceService.getIssuanceRequest(requestId, walletId))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(
                            e -> assertThat(((BusinessException) e).getErrorCode())
                                    .isEqualTo(ErrorCode.ACCESS_DENIED));
        }

        @Test
        @DisplayName("적립 요청 상태 조회 - Lazy Expiration 처리")
        void getIssuanceRequest_LazyExpiration() {
            // given
            Long requestId = 1L;
            Long walletId = 1L;
            Long walletStampCardId = 10L;

            IssuanceRequest request =
                    createExpiredButPendingIssuanceRequest(requestId, 1L, walletId, walletStampCardId);
            WalletStampCard walletStampCard = createWalletStampCard(walletStampCardId, walletId, 1L, 3);

            given(issuanceRequestRepository.findById(requestId)).willReturn(Optional.of(request));
            given(walletStampCardRepository.findById(walletStampCardId))
                    .willReturn(Optional.of(walletStampCard));

            // when
            IssuanceRequestResponse response =
                    customerIssuanceService.getIssuanceRequest(requestId, walletId);

            // then
            assertThat(response.status()).isEqualTo(IssuanceRequestStatus.EXPIRED);
        }
    }

    // Helper methods
    private WalletStampCard createWalletStampCard(
            Long id, Long customerWalletId, Long storeId, int stampCount) {
        WalletStampCard walletStampCard =
                WalletStampCard.builder()
                        .customerWalletId(customerWalletId)
                        .storeId(storeId)
                        .stampCardId(1L)
                        .stampCount(stampCount)
                        .build();
        ReflectionTestUtils.setField(walletStampCard, "id", id);
        return walletStampCard;
    }

    private IssuanceRequest createIssuanceRequest(
            Long id, Long storeId, Long walletId, Long walletStampCardId) {
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(storeId)
                        .walletId(walletId)
                        .walletStampCardId(walletStampCardId)
                        .idempotencyKey("test-key")
                        .expiresAt(LocalDateTime.now().plusSeconds(120))
                        .build();
        ReflectionTestUtils.setField(request, "id", id);
        ReflectionTestUtils.setField(request, "createdAt", LocalDateTime.now());
        return request;
    }

    private IssuanceRequest createExpiredIssuanceRequest(
            Long id, Long storeId, Long walletId, Long walletStampCardId) {
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(storeId)
                        .walletId(walletId)
                        .walletStampCardId(walletStampCardId)
                        .idempotencyKey("test-key")
                        .expiresAt(LocalDateTime.now().minusSeconds(60))
                        .build();
        ReflectionTestUtils.setField(request, "id", id);
        ReflectionTestUtils.setField(request, "status", IssuanceRequestStatus.EXPIRED);
        ReflectionTestUtils.setField(request, "createdAt", LocalDateTime.now().minusSeconds(180));
        return request;
    }

    private IssuanceRequest createExpiredButPendingIssuanceRequest(
            Long id, Long storeId, Long walletId, Long walletStampCardId) {
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(storeId)
                        .walletId(walletId)
                        .walletStampCardId(walletStampCardId)
                        .idempotencyKey("test-key")
                        .expiresAt(LocalDateTime.now().minusSeconds(60))
                        .build();
        ReflectionTestUtils.setField(request, "id", id);
        ReflectionTestUtils.setField(request, "createdAt", LocalDateTime.now().minusSeconds(180));
        return request;
    }
}
