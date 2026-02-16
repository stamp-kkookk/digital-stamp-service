package com.project.kkookk.wallet.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class WalletRewardTest {

    @Test
    @DisplayName("리워드 생성 시 기본 상태는 AVAILABLE")
    void should_CreateWithAvailableStatus_When_Created() {
        // given & when
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .build();

        // then
        assertThat(reward.getStatus()).isEqualTo(WalletRewardStatus.AVAILABLE);
        assertThat(reward.isAvailable()).isTrue();
    }

    @Test
    @DisplayName("만료 시간이 없는 리워드는 항상 사용 가능")
    void should_BeAvailable_When_NoExpiryDate() {
        // given & when
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .build();

        // then
        assertThat(reward.isAvailable()).isTrue();
        assertThat(reward.isExpired()).isFalse();
    }

    @Test
    @DisplayName("만료 시간이 지난 리워드는 만료됨")
    void should_BeExpired_When_ExpiryDateIsPast() {
        // given & when
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now().minusDays(31))
                        .expiresAt(LocalDateTime.now().minusDays(1))
                        .build();

        // then
        assertThat(reward.isExpired()).isTrue();
        assertThat(reward.isAvailable()).isFalse();
    }

    @Test
    @DisplayName("AVAILABLE 리워드 사용 성공 (AVAILABLE → REDEEMED 직행)")
    void should_Redeem_When_StatusIsAvailable() {
        // given
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .build();

        // when
        reward.redeem();

        // then
        assertThat(reward.getStatus()).isEqualTo(WalletRewardStatus.REDEEMED);
        assertThat(reward.getRedeemedAt()).isNotNull();
        assertThat(reward.isAvailable()).isFalse();
    }

    @Test
    @DisplayName("만료된 리워드는 사용 불가")
    void should_ThrowException_When_RedeemExpiredReward() {
        // given
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now().minusDays(31))
                        .expiresAt(LocalDateTime.now().minusDays(1))
                        .build();

        // when & then
        assertThatThrownBy(reward::redeem)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only AVAILABLE rewards can be redeemed");
    }

    @Test
    @DisplayName("이미 사용 완료된 리워드는 재사용 불가")
    void should_ThrowException_When_RedeemAlreadyRedeemedReward() {
        // given
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .build();
        reward.redeem();

        // when & then
        assertThatThrownBy(reward::redeem)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only AVAILABLE rewards can be redeemed");
    }

    @Test
    @DisplayName("이미 사용 완료된 리워드는 만료 처리 불가")
    void should_ThrowException_When_ExpireRedeemedReward() {
        // given
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .build();
        reward.redeem();

        // when & then
        assertThatThrownBy(reward::expire)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("REDEEMED rewards cannot be expired");
    }
}
