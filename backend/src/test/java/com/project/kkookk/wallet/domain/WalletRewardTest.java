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
    @DisplayName("AVAILABLE 리워드 사용 시작 성공")
    void should_StartRedeeming_When_StatusIsAvailable() {
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
        reward.startRedeeming();

        // then
        assertThat(reward.getStatus()).isEqualTo(WalletRewardStatus.REDEEMING);
        assertThat(reward.isAvailable()).isFalse();
    }

    @Test
    @DisplayName("REDEEMING 상태의 리워드 사용 완료 성공")
    void should_CompleteRedeem_When_StatusIsRedeeming() {
        // given
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .build();
        reward.startRedeeming();

        // when
        reward.completeRedeem();

        // then
        assertThat(reward.getStatus()).isEqualTo(WalletRewardStatus.REDEEMED);
        assertThat(reward.getRedeemedAt()).isNotNull();
    }

    @Test
    @DisplayName("REDEEMING 상태의 리워드 취소 가능")
    void should_CancelRedeeming_When_StatusIsRedeeming() {
        // given
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .build();
        reward.startRedeeming();

        // when
        reward.cancelRedeeming();

        // then
        assertThat(reward.getStatus()).isEqualTo(WalletRewardStatus.AVAILABLE);
        assertThat(reward.isAvailable()).isTrue();
    }

    @Test
    @DisplayName("만료된 리워드는 사용 시작 불가")
    void should_ThrowException_When_StartRedeemingExpiredReward() {
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
        assertThatThrownBy(reward::startRedeeming)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only AVAILABLE rewards can be redeemed");
    }

    @Test
    @DisplayName("AVAILABLE 상태가 아닌 리워드는 사용 완료 불가")
    void should_ThrowException_When_CompleteRedeemNonRedeemingReward() {
        // given
        WalletReward reward =
                WalletReward.builder()
                        .walletId(1L)
                        .stampCardId(1L)
                        .storeId(1L)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(30))
                        .build();

        // when & then
        assertThatThrownBy(reward::completeRedeem)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only REDEEMING rewards can be completed");
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
        reward.startRedeeming();
        reward.completeRedeem();

        // when & then
        assertThatThrownBy(reward::expire)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("REDEEMED rewards cannot be expired");
    }
}
