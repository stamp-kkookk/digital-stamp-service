package com.project.kkookk.wallet.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.domain.WalletStampCardStatus;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CustomerWalletServiceTest {

    @InjectMocks private CustomerWalletService customerWalletService;

    @Mock private CustomerWalletRepository customerWalletRepository;
    @Mock private WalletStampCardRepository walletStampCardRepository;
    @Mock private StampCardRepository stampCardRepository;
    @Mock private StoreRepository storeRepository;

    @Nested
    @DisplayName("ensureWalletStampCardForStore")
    class EnsureWalletStampCardForStoreTest {

        @Test
        @DisplayName("비관적 락으로 지갑 조회 후 ACTIVE 카드 없으면 새 카드 생성")
        void createsNewCard_WhenNoActiveCardExists() {
            // given
            Long walletId = 1L;
            Long storeId = 10L;
            Long stampCardId = 100L;

            CustomerWallet wallet = createCustomerWallet(walletId);
            StampCard stampCard = createStampCard(stampCardId, storeId);
            Store store = createStore(storeId);

            given(customerWalletRepository.findByIdWithLock(walletId))
                    .willReturn(Optional.of(wallet));
            given(
                            walletStampCardRepository.findByCustomerWalletIdAndStoreIdAndStatus(
                                    walletId, storeId, WalletStampCardStatus.ACTIVE))
                    .willReturn(Optional.empty());
            given(
                            stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                    storeId, StampCardStatus.ACTIVE))
                    .willReturn(Optional.of(stampCard));
            given(storeRepository.findById(storeId)).willReturn(Optional.of(store));
            given(walletStampCardRepository.save(any(WalletStampCard.class)))
                    .willAnswer(invocation -> invocation.getArgument(0));

            // when
            customerWalletService.ensureWalletStampCardForStore(walletId, storeId);

            // then
            verify(customerWalletRepository).findByIdWithLock(walletId);
            verify(walletStampCardRepository).save(any(WalletStampCard.class));
        }

        @Test
        @DisplayName("ACTIVE 카드가 이미 존재하면 새 카드를 생성하지 않음")
        void doesNotCreateCard_WhenActiveCardAlreadyExists() {
            // given
            Long walletId = 1L;
            Long storeId = 10L;

            CustomerWallet wallet = createCustomerWallet(walletId);
            WalletStampCard existingCard =
                    WalletStampCard.builder()
                            .customerWalletId(walletId)
                            .storeId(storeId)
                            .stampCardId(100L)
                            .stampCount(3)
                            .build();

            given(customerWalletRepository.findByIdWithLock(walletId))
                    .willReturn(Optional.of(wallet));
            given(
                            walletStampCardRepository.findByCustomerWalletIdAndStoreIdAndStatus(
                                    walletId, storeId, WalletStampCardStatus.ACTIVE))
                    .willReturn(Optional.of(existingCard));

            // when
            customerWalletService.ensureWalletStampCardForStore(walletId, storeId);

            // then
            verify(customerWalletRepository).findByIdWithLock(walletId);
            verify(walletStampCardRepository, never()).save(any(WalletStampCard.class));
        }

        @Test
        @DisplayName("매장에 ACTIVE 스탬프카드가 없으면 생성 스킵")
        void skipsCreation_WhenStoreHasNoActiveStampCard() {
            // given
            Long walletId = 1L;
            Long storeId = 10L;

            CustomerWallet wallet = createCustomerWallet(walletId);

            given(customerWalletRepository.findByIdWithLock(walletId))
                    .willReturn(Optional.of(wallet));
            given(
                            walletStampCardRepository.findByCustomerWalletIdAndStoreIdAndStatus(
                                    walletId, storeId, WalletStampCardStatus.ACTIVE))
                    .willReturn(Optional.empty());
            given(
                            stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                    storeId, StampCardStatus.ACTIVE))
                    .willReturn(Optional.empty());

            // when
            customerWalletService.ensureWalletStampCardForStore(walletId, storeId);

            // then
            verify(customerWalletRepository).findByIdWithLock(walletId);
            verify(walletStampCardRepository, never()).save(any(WalletStampCard.class));
        }
    }

    // Helper methods
    private CustomerWallet createCustomerWallet(Long id) {
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("테스트")
                        .nickname("테스트닉네임")
                        .build();
        ReflectionTestUtils.setField(wallet, "id", id);
        return wallet;
    }

    private StampCard createStampCard(Long id, Long storeId) {
        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("테스트카드").goalStampCount(10).build();
        ReflectionTestUtils.setField(stampCard, "id", id);
        ReflectionTestUtils.setField(stampCard, "status", StampCardStatus.ACTIVE);
        return stampCard;
    }

    private Store createStore(Long id) {
        Store store = new Store("테스트 매장", "서울시 강남구", "02-1234-5678", null, null, null, 1L);
        ReflectionTestUtils.setField(store, "id", id);
        ReflectionTestUtils.setField(store, "status", StoreStatus.LIVE);
        return store;
    }
}
