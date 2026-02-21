package com.project.kkookk.wallet.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class WalletStampCardTest {

    @Test
    @DisplayName("지갑 스탬프 카드 생성 시 기본 스탬프 개수는 0")
    void should_CreateWithZeroStamps_When_StampCountNotProvided() {
        // given & when
        WalletStampCard walletStampCard =
                WalletStampCard.builder().customerWalletId(1L).storeId(1L).stampCardId(1L).build();

        // then
        assertThat(walletStampCard.getStampCount()).isZero();
        assertThat(walletStampCard.getLastStampedAt()).isNull();
    }

    @Test
    @DisplayName("스탬프 적립 시 개수 증가 및 시각 기록")
    void should_IncreaseStampCountAndRecordTime_When_AddStamps() {
        // given
        WalletStampCard walletStampCard =
                WalletStampCard.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .stampCardId(1L)
                        .stampCount(3)
                        .build();

        // when
        walletStampCard.addStamps(2);

        // then
        assertThat(walletStampCard.getStampCount()).isEqualTo(5);
        assertThat(walletStampCard.getLastStampedAt()).isNotNull();
    }

    @Test
    @DisplayName("스탬프 리셋 시 개수 0으로 초기화")
    void should_ResetStampCountToZero_When_ResetStamps() {
        // given
        WalletStampCard walletStampCard =
                WalletStampCard.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .stampCardId(1L)
                        .stampCount(10)
                        .build();

        // when
        walletStampCard.resetStamps();

        // then
        assertThat(walletStampCard.getStampCount()).isZero();
    }

    @Test
    @DisplayName("여러 번 스탬프 적립 시 개수 누적")
    void should_AccumulateStamps_When_AddStampsMultipleTimes() {
        // given
        WalletStampCard walletStampCard =
                WalletStampCard.builder().customerWalletId(1L).storeId(1L).stampCardId(1L).build();

        // when
        walletStampCard.addStamps(3);
        walletStampCard.addStamps(2);
        walletStampCard.addStamps(1);

        // then
        assertThat(walletStampCard.getStampCount()).isEqualTo(6);
    }
}
