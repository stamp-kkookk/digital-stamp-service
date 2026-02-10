package com.project.kkookk.migration.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.migration.domain.StampMigrationRequest;
import com.project.kkookk.migration.domain.StampMigrationStatus;
import com.project.kkookk.migration.dto.CreateMigrationRequest;
import com.project.kkookk.migration.dto.MigrationListItemResponse;
import com.project.kkookk.migration.dto.MigrationRequestResponse;
import com.project.kkookk.migration.repository.StampMigrationRequestRepository;
import com.project.kkookk.migration.service.exception.MigrationAccessDeniedException;
import com.project.kkookk.migration.service.exception.MigrationAlreadyPendingException;
import com.project.kkookk.migration.service.exception.MigrationImageTooLargeException;
import com.project.kkookk.migration.service.exception.MigrationRequestNotFoundException;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.store.service.exception.StoreNotFoundException;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerMigrationServiceTest {

    @InjectMocks private CustomerMigrationService customerMigrationService;

    @Mock private StampMigrationRequestRepository migrationRequestRepository;

    @Mock private CustomerWalletRepository customerWalletRepository;

    @Mock private StoreRepository storeRepository;

    private static final Long CUSTOMER_WALLET_ID = 1L;
    private static final Long STORE_ID = 100L;
    private static final String VALID_BASE64_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRg";

    @Test
    @DisplayName("마이그레이션 요청 생성 성공")
    void createMigrationRequest_Success() {
        // given
        CreateMigrationRequest request =
                new CreateMigrationRequest(STORE_ID, VALID_BASE64_IMAGE, 5);

        CustomerWallet customerWallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동")
                        .status(CustomerWalletStatus.ACTIVE)
                        .build();

        StampMigrationRequest savedRequest =
                StampMigrationRequest.builder()
                        .customerWalletId(CUSTOMER_WALLET_ID)
                        .storeId(STORE_ID)
                        .imageData(VALID_BASE64_IMAGE)
                        .claimedStampCount(5)
                        .requestedAt(LocalDateTime.now())
                        .build();

        given(customerWalletRepository.findById(CUSTOMER_WALLET_ID))
                .willReturn(Optional.of(customerWallet));
        given(storeRepository.existsById(STORE_ID)).willReturn(true);
        given(
                        migrationRequestRepository.existsByCustomerWalletIdAndStoreIdAndStatus(
                                CUSTOMER_WALLET_ID, STORE_ID, StampMigrationStatus.SUBMITTED))
                .willReturn(false);
        given(migrationRequestRepository.save(any())).willReturn(savedRequest);

        // when
        MigrationRequestResponse response =
                customerMigrationService.createMigrationRequest(CUSTOMER_WALLET_ID, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.customerWalletId()).isEqualTo(CUSTOMER_WALLET_ID);
        assertThat(response.storeId()).isEqualTo(STORE_ID);
        assertThat(response.status()).isEqualTo(StampMigrationStatus.SUBMITTED);
        assertThat(response.claimedStampCount()).isEqualTo(5);
        assertThat(response.slaMessage()).isEqualTo("24~48시간 이내 처리됩니다");

        verify(migrationRequestRepository).save(any(StampMigrationRequest.class));
    }

    @Test
    @DisplayName("마이그레이션 요청 생성 실패 - 이미지 크기 초과")
    void createMigrationRequest_Fail_ImageTooLarge() {
        // given - 5MB 이상의 이미지 (약 7MB)
        String largeBase64 = "data:image/jpeg;base64," + "A".repeat(10_000_000);
        CreateMigrationRequest request = new CreateMigrationRequest(STORE_ID, largeBase64, 5);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerMigrationService.createMigrationRequest(
                                        CUSTOMER_WALLET_ID, request))
                .isInstanceOf(MigrationImageTooLargeException.class);

        verify(customerWalletRepository, never()).findById(any());
        verify(migrationRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("마이그레이션 요청 생성 실패 - 고객 지갑 없음")
    void createMigrationRequest_Fail_WalletNotFound() {
        // given
        CreateMigrationRequest request =
                new CreateMigrationRequest(STORE_ID, VALID_BASE64_IMAGE, 5);

        given(customerWalletRepository.findById(CUSTOMER_WALLET_ID)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(
                        () ->
                                customerMigrationService.createMigrationRequest(
                                        CUSTOMER_WALLET_ID, request))
                .isInstanceOf(CustomerWalletNotFoundException.class);

        verify(migrationRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("마이그레이션 요청 생성 실패 - 지갑 차단됨")
    void createMigrationRequest_Fail_WalletBlocked() {
        // given
        CreateMigrationRequest request =
                new CreateMigrationRequest(STORE_ID, VALID_BASE64_IMAGE, 5);

        CustomerWallet blockedWallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동")
                        .status(CustomerWalletStatus.BLOCKED)
                        .build();

        given(customerWalletRepository.findById(CUSTOMER_WALLET_ID))
                .willReturn(Optional.of(blockedWallet));

        // when & then
        assertThatThrownBy(
                        () ->
                                customerMigrationService.createMigrationRequest(
                                        CUSTOMER_WALLET_ID, request))
                .isInstanceOf(CustomerWalletBlockedException.class);

        verify(migrationRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("마이그레이션 요청 생성 실패 - 매장 없음")
    void createMigrationRequest_Fail_StoreNotFound() {
        // given
        CreateMigrationRequest request =
                new CreateMigrationRequest(STORE_ID, VALID_BASE64_IMAGE, 5);

        CustomerWallet customerWallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동")
                        .status(CustomerWalletStatus.ACTIVE)
                        .build();

        given(customerWalletRepository.findById(CUSTOMER_WALLET_ID))
                .willReturn(Optional.of(customerWallet));
        given(storeRepository.existsById(STORE_ID)).willReturn(false);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerMigrationService.createMigrationRequest(
                                        CUSTOMER_WALLET_ID, request))
                .isInstanceOf(StoreNotFoundException.class);

        verify(migrationRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("마이그레이션 요청 생성 실패 - 이미 처리 중인 요청 존재")
    void createMigrationRequest_Fail_AlreadyPending() {
        // given
        CreateMigrationRequest request =
                new CreateMigrationRequest(STORE_ID, VALID_BASE64_IMAGE, 5);

        CustomerWallet customerWallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동")
                        .status(CustomerWalletStatus.ACTIVE)
                        .build();

        given(customerWalletRepository.findById(CUSTOMER_WALLET_ID))
                .willReturn(Optional.of(customerWallet));
        given(storeRepository.existsById(STORE_ID)).willReturn(true);
        given(
                        migrationRequestRepository.existsByCustomerWalletIdAndStoreIdAndStatus(
                                CUSTOMER_WALLET_ID, STORE_ID, StampMigrationStatus.SUBMITTED))
                .willReturn(true);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerMigrationService.createMigrationRequest(
                                        CUSTOMER_WALLET_ID, request))
                .isInstanceOf(MigrationAlreadyPendingException.class);

        verify(migrationRequestRepository, never()).save(any());
    }

    @Test
    @DisplayName("마이그레이션 요청 조회 성공")
    void getMigrationRequest_Success() {
        // given
        Long migrationId = 1L;

        StampMigrationRequest migrationRequest =
                StampMigrationRequest.builder()
                        .customerWalletId(CUSTOMER_WALLET_ID)
                        .storeId(STORE_ID)
                        .imageData(VALID_BASE64_IMAGE)
                        .claimedStampCount(5)
                        .requestedAt(LocalDateTime.now())
                        .build();

        given(
                        migrationRequestRepository.findByIdAndCustomerWalletId(
                                migrationId, CUSTOMER_WALLET_ID))
                .willReturn(Optional.of(migrationRequest));

        // when
        MigrationRequestResponse response =
                customerMigrationService.getMigrationRequest(CUSTOMER_WALLET_ID, migrationId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.customerWalletId()).isEqualTo(CUSTOMER_WALLET_ID);
        assertThat(response.storeId()).isEqualTo(STORE_ID);
        assertThat(response.status()).isEqualTo(StampMigrationStatus.SUBMITTED);
        assertThat(response.claimedStampCount()).isEqualTo(5);
    }

    @Test
    @DisplayName("마이그레이션 요청 조회 실패 - 요청 없음")
    void getMigrationRequest_Fail_NotFound() {
        // given
        Long migrationId = 999L;

        given(
                        migrationRequestRepository.findByIdAndCustomerWalletId(
                                migrationId, CUSTOMER_WALLET_ID))
                .willReturn(Optional.empty());
        given(migrationRequestRepository.existsById(migrationId)).willReturn(false);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerMigrationService.getMigrationRequest(
                                        CUSTOMER_WALLET_ID, migrationId))
                .isInstanceOf(MigrationRequestNotFoundException.class);
    }

    @Test
    @DisplayName("마이그레이션 요청 조회 실패 - 다른 고객의 요청")
    void getMigrationRequest_Fail_AccessDenied() {
        // given
        Long migrationId = 1L;
        Long otherWalletId = 999L;

        given(migrationRequestRepository.findByIdAndCustomerWalletId(migrationId, otherWalletId))
                .willReturn(Optional.empty());
        given(migrationRequestRepository.existsById(migrationId)).willReturn(true);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerMigrationService.getMigrationRequest(
                                        otherWalletId, migrationId))
                .isInstanceOf(MigrationAccessDeniedException.class);
    }

    @Test
    @DisplayName("내 마이그레이션 요청 목록 조회 성공")
    void getMyMigrationRequests_Success() {
        // given
        StampMigrationRequest request1 =
                StampMigrationRequest.builder()
                        .customerWalletId(CUSTOMER_WALLET_ID)
                        .storeId(STORE_ID)
                        .imageData(VALID_BASE64_IMAGE)
                        .claimedStampCount(5)
                        .requestedAt(LocalDateTime.now().minusDays(1))
                        .build();

        StampMigrationRequest request2 =
                StampMigrationRequest.builder()
                        .customerWalletId(CUSTOMER_WALLET_ID)
                        .storeId(200L)
                        .imageData(VALID_BASE64_IMAGE)
                        .claimedStampCount(3)
                        .requestedAt(LocalDateTime.now())
                        .build();

        given(
                        migrationRequestRepository.findByCustomerWalletIdOrderByRequestedAtDesc(
                                CUSTOMER_WALLET_ID))
                .willReturn(List.of(request2, request1));

        // when
        List<MigrationListItemResponse> responses =
                customerMigrationService.getMyMigrationRequests(CUSTOMER_WALLET_ID);

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).storeId()).isEqualTo(200L);
        assertThat(responses.get(0).claimedStampCount()).isEqualTo(3);
        assertThat(responses.get(1).storeId()).isEqualTo(STORE_ID);
        assertThat(responses.get(1).claimedStampCount()).isEqualTo(5);
    }

    @Test
    @DisplayName("내 마이그레이션 요청 목록 조회 - 빈 목록")
    void getMyMigrationRequests_EmptyList() {
        // given
        given(
                        migrationRequestRepository.findByCustomerWalletIdOrderByRequestedAtDesc(
                                CUSTOMER_WALLET_ID))
                .willReturn(List.of());

        // when
        List<MigrationListItemResponse> responses =
                customerMigrationService.getMyMigrationRequests(CUSTOMER_WALLET_ID);

        // then
        assertThat(responses).isEmpty();
    }
}
