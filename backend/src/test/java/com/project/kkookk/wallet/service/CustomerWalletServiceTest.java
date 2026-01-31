package com.project.kkookk.wallet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.domain.RedeemEventType;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.domain.StampCardSortType;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.WalletStampCardListResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException;
import com.project.kkookk.wallet.service.exception.WalletStampCardAccessDeniedException;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.LocalDateTime;
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
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerWalletService 테스트")
class CustomerWalletServiceTest {

    @InjectMocks private CustomerWalletService customerWalletService;

    @Mock private CustomerWalletRepository customerWalletRepository;

    @Mock private WalletStampCardRepository walletStampCardRepository;

    @Mock private StampCardRepository stampCardRepository;

    @Mock private StoreRepository storeRepository;

    @Mock private StampEventRepository stampEventRepository;

    @Mock private RedeemEventRepository redeemEventRepository;

    @Test
    @DisplayName("전화번호와 이름으로 지갑 홈 조회 성공")
    void getStampCardsByPhoneAndName_Success() {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";
        Long walletId = 1L;
        Long storeId = 10L;
        Long stampCardId = 100L;

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone(phone)
                        .name(name)
                        .nickname("길동이")
                        .status(CustomerWalletStatus.ACTIVE)
                        .build();
        ReflectionTestUtils.setField(wallet, "id", walletId);

        WalletStampCard walletStampCard =
                WalletStampCard.builder()
                        .customerWalletId(walletId)
                        .storeId(storeId)
                        .stampCardId(stampCardId)
                        .stampCount(7)
                        .build();
        ReflectionTestUtils.setField(walletStampCard, "id", 1L);
        ReflectionTestUtils.setField(walletStampCard, "createdAt", LocalDateTime.now());

        StampCard stampCard =
                StampCard.builder()
                        .storeId(storeId)
                        .title("아메리카노 10잔 쿠폰")
                        .goalStampCount(10)
                        .requiredStamps(10)
                        .rewardName("아메리카노 1잔")
                        .rewardQuantity(1)
                        .expireDays(30)
                        .build();
        ReflectionTestUtils.setField(stampCard, "id", stampCardId);

        Store store = new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", StoreStatus.ACTIVE, 1L);
        ReflectionTestUtils.setField(store, "id", storeId);

        given(customerWalletRepository.findByPhoneAndName(phone, name))
                .willReturn(Optional.of(wallet));
        given(walletStampCardRepository.findByCustomerWalletIdOrderByLastStampedAtDesc(walletId))
                .willReturn(List.of(walletStampCard));
        given(stampCardRepository.findAllById(anyCollection())).willReturn(List.of(stampCard));
        given(storeRepository.findAllById(anyCollection())).willReturn(List.of(store));

        // when
        WalletStampCardListResponse response =
                customerWalletService.getStampCardsByPhoneAndName(
                        phone, name, StampCardSortType.LAST_STAMPED);

        // then
        assertThat(response).isNotNull();
        assertThat(response.customerName()).isEqualTo(name);
        assertThat(response.stampCards()).hasSize(1);
        assertThat(response.stampCards().get(0).title()).isEqualTo("아메리카노 10잔 쿠폰");
        assertThat(response.stampCards().get(0).currentStampCount()).isEqualTo(7);
        assertThat(response.stampCards().get(0).goalStampCount()).isEqualTo(10);
        assertThat(response.stampCards().get(0).progressPercentage()).isEqualTo(70);

        verify(customerWalletRepository).findByPhoneAndName(phone, name);
        verify(walletStampCardRepository).findByCustomerWalletIdOrderByLastStampedAtDesc(walletId);
    }

    @Test
    @DisplayName("전화번호와 이름으로 지갑 조회 실패 - 지갑 없음")
    void getStampCardsByPhoneAndName_Fail_WalletNotFound() {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";

        given(customerWalletRepository.findByPhoneAndName(phone, name))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(
                        () ->
                                customerWalletService.getStampCardsByPhoneAndName(
                                        phone, name, StampCardSortType.LAST_STAMPED))
                .isInstanceOf(CustomerWalletNotFoundException.class)
                .hasMessageContaining("해당 전화번호와 이름으로 지갑을 찾을 수 없습니다");

        verify(customerWalletRepository).findByPhoneAndName(phone, name);
    }

    @Test
    @DisplayName("전화번호와 이름으로 지갑 조회 실패 - BLOCKED 상태")
    void getStampCardsByPhoneAndName_Fail_WalletBlocked() {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";

        CustomerWallet blockedWallet =
                CustomerWallet.builder()
                        .phone(phone)
                        .name(name)
                        .nickname("길동이")
                        .status(CustomerWalletStatus.BLOCKED)
                        .build();

        given(customerWalletRepository.findByPhoneAndName(phone, name))
                .willReturn(Optional.of(blockedWallet));

        // when & then
        assertThatThrownBy(
                        () ->
                                customerWalletService.getStampCardsByPhoneAndName(
                                        phone, name, StampCardSortType.LAST_STAMPED))
                .isInstanceOf(CustomerWalletBlockedException.class)
                .hasMessageContaining("차단된 지갑입니다");

        verify(customerWalletRepository).findByPhoneAndName(phone, name);
    }

    @Test
    @DisplayName("생성순 정렬로 지갑 홈 조회 성공")
    void getStampCardsByPhoneAndName_Success_SortByCreated() {
        // given
        String phone = "010-1234-5678";
        String name = "홍길동";
        Long walletId = 1L;

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone(phone)
                        .name(name)
                        .nickname("길동이")
                        .status(CustomerWalletStatus.ACTIVE)
                        .build();

        ReflectionTestUtils.setField(wallet, "id", walletId);

        given(customerWalletRepository.findByPhoneAndName(phone, name))
                .willReturn(Optional.of(wallet));
        given(walletStampCardRepository.findByCustomerWalletIdOrderByCreatedAtDesc(walletId))
                .willReturn(List.of());
        given(stampCardRepository.findAllById(anyCollection())).willReturn(List.of());
        given(storeRepository.findAllById(anyCollection())).willReturn(List.of());

        // when
        WalletStampCardListResponse response =
                customerWalletService.getStampCardsByPhoneAndName(
                        phone, name, StampCardSortType.CREATED);

        // then
        assertThat(response).isNotNull();
        verify(walletStampCardRepository).findByCustomerWalletIdOrderByCreatedAtDesc(walletId);
    }

    @Test
    @DisplayName("스탬프 적립 히스토리 조회 성공")
    void getStampHistory_Success() {
        // given
        Long walletStampCardId = 1L;
        Long walletId = 10L;
        Pageable pageable = PageRequest.of(0, 20);

        WalletStampCard walletStampCard =
                WalletStampCard.builder()
                        .customerWalletId(walletId)
                        .storeId(1L)
                        .stampCardId(100L)
                        .stampCount(5)
                        .build();

        StampEvent event1 =
                StampEvent.builder()
                        .storeId(1L)
                        .stampCardId(100L)
                        .walletStampCardId(walletStampCardId)
                        .type(StampEventType.ISSUED)
                        .delta(2)
                        .reason("아메리카노 2잔 구매")
                        .occurredAt(LocalDateTime.now())
                        .build();

        Page<StampEvent> eventPage = new PageImpl<>(List.of(event1), pageable, 1);

        given(walletStampCardRepository.findByIdAndCustomerWalletId(walletStampCardId, walletId))
                .willReturn(Optional.of(walletStampCard));
        given(
                        stampEventRepository.findByWalletStampCardIdOrderByOccurredAtDesc(
                                walletStampCardId, pageable))
                .willReturn(eventPage);

        // when
        StampEventHistoryResponse response =
                customerWalletService.getStampHistory(walletStampCardId, walletId, pageable);

        // then
        assertThat(response).isNotNull();
        assertThat(response.events()).hasSize(1);
        assertThat(response.events().get(0).type()).isEqualTo(StampEventType.ISSUED);
        assertThat(response.events().get(0).delta()).isEqualTo(2);
        assertThat(response.pageInfo().totalElements()).isEqualTo(1);

        verify(walletStampCardRepository).findByIdAndCustomerWalletId(walletStampCardId, walletId);
        verify(stampEventRepository)
                .findByWalletStampCardIdOrderByOccurredAtDesc(walletStampCardId, pageable);
    }

    @Test
    @DisplayName("스탬프 적립 히스토리 조회 실패 - 다른 고객의 스탬프카드")
    void getStampHistory_Fail_AccessDenied() {
        // given
        Long walletStampCardId = 1L;
        Long walletId = 10L;
        Pageable pageable = PageRequest.of(0, 20);

        given(walletStampCardRepository.findByIdAndCustomerWalletId(walletStampCardId, walletId))
                .willReturn(Optional.empty());
        given(walletStampCardRepository.existsById(walletStampCardId)).willReturn(true);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerWalletService.getStampHistory(
                                        walletStampCardId, walletId, pageable))
                .isInstanceOf(WalletStampCardAccessDeniedException.class)
                .hasMessageContaining("다른 고객의 스탬프카드에 접근할 수 없습니다");

        verify(walletStampCardRepository).findByIdAndCustomerWalletId(walletStampCardId, walletId);
    }

    @Test
    @DisplayName("스탬프 적립 히스토리 조회 실패 - 스탬프카드 없음")
    void getStampHistory_Fail_NotFound() {
        // given
        Long walletStampCardId = 1L;
        Long walletId = 10L;
        Pageable pageable = PageRequest.of(0, 20);

        given(walletStampCardRepository.findByIdAndCustomerWalletId(walletStampCardId, walletId))
                .willReturn(Optional.empty());
        given(walletStampCardRepository.existsById(walletStampCardId)).willReturn(false);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerWalletService.getStampHistory(
                                        walletStampCardId, walletId, pageable))
                .isInstanceOf(WalletStampCardNotFoundException.class)
                .hasMessageContaining("해당 지갑 스탬프카드를 찾을 수 없습니다");

        verify(walletStampCardRepository).findByIdAndCustomerWalletId(walletStampCardId, walletId);
    }

    @Test
    @DisplayName("리워드 사용 히스토리 조회 성공")
    void getRedeemHistory_Success() {
        // given
        Long walletId = 1L;
        Long storeId = 10L;
        Pageable pageable = PageRequest.of(0, 20);

        RedeemEvent event1 =
                RedeemEvent.builder()
                        .redeemSessionId(100L)
                        .walletId(walletId)
                        .storeId(storeId)
                        .type(RedeemEventType.COMPLETED)
                        .result(RedeemEventResult.SUCCESS)
                        .occurredAt(LocalDateTime.now())
                        .build();

        Page<RedeemEvent> eventPage = new PageImpl<>(List.of(event1), pageable, 1);

        Store store = new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", StoreStatus.ACTIVE, 1L);
        ReflectionTestUtils.setField(store, "id", storeId);

        given(redeemEventRepository.findByWalletIdOrderByOccurredAtDesc(walletId, pageable))
                .willReturn(eventPage);
        given(storeRepository.findAllById(anyCollection())).willReturn(List.of(store));

        // when
        RedeemEventHistoryResponse response =
                customerWalletService.getRedeemHistory(walletId, pageable);

        // then
        assertThat(response).isNotNull();
        assertThat(response.events()).hasSize(1);
        assertThat(response.events().get(0).type()).isEqualTo(RedeemEventType.COMPLETED);
        assertThat(response.events().get(0).result()).isEqualTo(RedeemEventResult.SUCCESS);
        assertThat(response.events().get(0).store().storeName()).isEqualTo("꾹꾹 카페");
        assertThat(response.pageInfo().totalElements()).isEqualTo(1);

        verify(redeemEventRepository).findByWalletIdOrderByOccurredAtDesc(walletId, pageable);
        verify(storeRepository).findAllById(anyCollection());
    }

    @Test
    @DisplayName("리워드 사용 히스토리 조회 - 빈 목록")
    void getRedeemHistory_EmptyList() {
        // given
        Long walletId = 1L;
        Pageable pageable = PageRequest.of(0, 20);

        Page<RedeemEvent> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        given(redeemEventRepository.findByWalletIdOrderByOccurredAtDesc(walletId, pageable))
                .willReturn(emptyPage);
        given(storeRepository.findAllById(anyCollection())).willReturn(List.of());

        // when
        RedeemEventHistoryResponse response =
                customerWalletService.getRedeemHistory(walletId, pageable);

        // then
        assertThat(response).isNotNull();
        assertThat(response.events()).isEmpty();
        assertThat(response.pageInfo().totalElements()).isEqualTo(0);

        verify(redeemEventRepository).findByWalletIdOrderByOccurredAtDesc(walletId, pageable);
    }
}
