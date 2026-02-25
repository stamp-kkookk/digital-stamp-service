package com.project.kkookk.redeem.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.redeem.controller.dto.RedeemRewardRequest;
import com.project.kkookk.redeem.controller.dto.RedeemRewardResponse;
import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class CustomerRedeemServiceTest {

    @InjectMocks private CustomerRedeemService customerRedeemService;

    @Mock private RedeemEventRepository redeemEventRepository;
    @Mock private WalletRewardRepository walletRewardRepository;
    @Mock private CustomerWalletRepository customerWalletRepository;
    @Mock private StoreRepository storeRepository;
    @Mock private StampCardRepository stampCardRepository;

    private static final Long WALLET_ID = 1L;
    private static final Long REWARD_ID = 10L;
    private static final Long STORE_ID = 100L;
    private static final Long STAMP_CARD_ID = 200L;

    @Nested
    @DisplayName("redeemReward")
    class RedeemRewardTest {

        @Test
        @DisplayName("리워드 사용 성공")
        void redeemReward_Success() {
            // given
            RedeemRewardRequest request = new RedeemRewardRequest(REWARD_ID);
            WalletReward reward = createAvailableReward();
            Store store = createLiveStore();
            StampCard stampCard = createStampCard("아메리카노 1잔");
            RedeemEvent savedEvent = createRedeemEvent();

            mockActiveWallet();
            given(walletRewardRepository.findByIdAndWalletId(REWARD_ID, WALLET_ID))
                    .willReturn(Optional.of(reward));
            given(storeRepository.findById(STORE_ID)).willReturn(Optional.of(store));
            given(walletRewardRepository.saveAndFlush(reward)).willReturn(reward);
            given(redeemEventRepository.save(any(RedeemEvent.class))).willReturn(savedEvent);
            given(stampCardRepository.findById(STAMP_CARD_ID)).willReturn(Optional.of(stampCard));

            // when
            RedeemRewardResponse response = customerRedeemService.redeemReward(WALLET_ID, request);

            // then
            assertThat(response.walletRewardId()).isEqualTo(REWARD_ID);
            assertThat(response.rewardName()).isEqualTo("아메리카노 1잔");
            verify(walletRewardRepository).saveAndFlush(reward);
            verify(redeemEventRepository).save(any(RedeemEvent.class));
        }

        @Test
        @DisplayName("차단된 지갑으로 리워드 사용 실패")
        void redeemReward_Fail_WalletBlocked() {
            // given
            RedeemRewardRequest request = new RedeemRewardRequest(REWARD_ID);
            mockBlockedWallet();

            // when & then
            assertThatThrownBy(() -> customerRedeemService.redeemReward(WALLET_ID, request))
                    .isInstanceOf(CustomerWalletBlockedException.class);
        }

        @Test
        @DisplayName("리워드를 찾을 수 없으면 REWARD_NOT_FOUND")
        void redeemReward_RewardNotFound() {
            // given
            RedeemRewardRequest request = new RedeemRewardRequest(REWARD_ID);
            mockActiveWallet();
            given(walletRewardRepository.findByIdAndWalletId(REWARD_ID, WALLET_ID))
                    .willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> customerRedeemService.redeemReward(WALLET_ID, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting(e -> ((BusinessException) e).getErrorCode())
                    .isEqualTo(ErrorCode.REWARD_NOT_FOUND);
        }

        @Test
        @DisplayName("매장이 비운영 상태이면 STORE_INACTIVE")
        void redeemReward_StoreInactive() {
            // given
            RedeemRewardRequest request = new RedeemRewardRequest(REWARD_ID);
            WalletReward reward = createAvailableReward();
            Store store = createStore(StoreStatus.SUSPENDED);

            mockActiveWallet();
            given(walletRewardRepository.findByIdAndWalletId(REWARD_ID, WALLET_ID))
                    .willReturn(Optional.of(reward));
            given(storeRepository.findById(STORE_ID)).willReturn(Optional.of(store));

            // when & then
            assertThatThrownBy(() -> customerRedeemService.redeemReward(WALLET_ID, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting(e -> ((BusinessException) e).getErrorCode())
                    .isEqualTo(ErrorCode.STORE_INACTIVE);
        }

        @Test
        @DisplayName("이미 사용된 리워드이면 REWARD_NOT_AVAILABLE")
        void redeemReward_AlreadyRedeemed() {
            // given
            RedeemRewardRequest request = new RedeemRewardRequest(REWARD_ID);
            WalletReward reward = createRedeemedReward();
            Store store = createLiveStore();

            mockActiveWallet();
            given(walletRewardRepository.findByIdAndWalletId(REWARD_ID, WALLET_ID))
                    .willReturn(Optional.of(reward));
            given(storeRepository.findById(STORE_ID)).willReturn(Optional.of(store));

            // when & then
            assertThatThrownBy(() -> customerRedeemService.redeemReward(WALLET_ID, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting(e -> ((BusinessException) e).getErrorCode())
                    .isEqualTo(ErrorCode.REWARD_NOT_AVAILABLE);
        }

        @Test
        @DisplayName("낙관적 락 충돌 시 REWARD_NOT_AVAILABLE (이중 사용 방지)")
        void redeemReward_OptimisticLockConflict() {
            // given
            RedeemRewardRequest request = new RedeemRewardRequest(REWARD_ID);
            WalletReward reward = createAvailableReward();
            Store store = createLiveStore();

            mockActiveWallet();
            given(walletRewardRepository.findByIdAndWalletId(REWARD_ID, WALLET_ID))
                    .willReturn(Optional.of(reward));
            given(storeRepository.findById(STORE_ID)).willReturn(Optional.of(store));
            given(walletRewardRepository.saveAndFlush(reward))
                    .willThrow(
                            new ObjectOptimisticLockingFailureException(
                                    WalletReward.class.getName(), REWARD_ID));

            // when & then
            assertThatThrownBy(() -> customerRedeemService.redeemReward(WALLET_ID, request))
                    .isInstanceOf(BusinessException.class)
                    .extracting(e -> ((BusinessException) e).getErrorCode())
                    .isEqualTo(ErrorCode.REWARD_NOT_AVAILABLE);

            verify(redeemEventRepository, never()).save(any(RedeemEvent.class));
        }
    }

    private WalletReward createAvailableReward() {
        WalletReward reward =
                WalletReward.builder()
                        .walletId(WALLET_ID)
                        .stampCardId(STAMP_CARD_ID)
                        .storeId(STORE_ID)
                        .build();
        ReflectionTestUtils.setField(reward, "id", REWARD_ID);
        return reward;
    }

    private WalletReward createRedeemedReward() {
        WalletReward reward = createAvailableReward();
        reward.redeem();
        return reward;
    }

    private Store createLiveStore() {
        return createStore(StoreStatus.LIVE);
    }

    private Store createStore(StoreStatus status) {
        Store store = new Store("테스트 매장", "서울시", "010-1234-5678", null, null, null, 1L);
        ReflectionTestUtils.setField(store, "id", STORE_ID);
        ReflectionTestUtils.setField(store, "status", status);
        return store;
    }

    private StampCard createStampCard(String rewardName) {
        StampCard stampCard =
                StampCard.builder()
                        .storeId(STORE_ID)
                        .title("테스트 스탬프카드")
                        .goalStampCount(10)
                        .rewardName(rewardName)
                        .build();
        ReflectionTestUtils.setField(stampCard, "id", STAMP_CARD_ID);
        return stampCard;
    }

    private RedeemEvent createRedeemEvent() {
        RedeemEvent event =
                RedeemEvent.builder()
                        .walletRewardId(REWARD_ID)
                        .walletId(WALLET_ID)
                        .storeId(STORE_ID)
                        .result(com.project.kkookk.redeem.domain.RedeemEventResult.SUCCESS)
                        .build();
        ReflectionTestUtils.setField(event, "id", 1L);
        return event;
    }

    private void mockActiveWallet() {
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-0000-0000")
                        .name("테스트")
                        .nickname("test")
                        .build();
        ReflectionTestUtils.setField(wallet, "id", WALLET_ID);
        given(customerWalletRepository.findById(WALLET_ID)).willReturn(Optional.of(wallet));
    }

    private void mockBlockedWallet() {
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-0000-0000")
                        .name("테스트")
                        .nickname("test")
                        .build();
        ReflectionTestUtils.setField(wallet, "id", WALLET_ID);
        wallet.block();
        given(customerWalletRepository.findById(WALLET_ID)).willReturn(Optional.of(wallet));
    }
}
