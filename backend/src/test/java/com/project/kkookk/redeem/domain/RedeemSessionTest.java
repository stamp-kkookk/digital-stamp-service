package com.project.kkookk.redeem.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RedeemSessionTest {

    @Test
    @DisplayName("리딤 세션 생성 시 기본 상태는 PENDING")
    void should_CreateWithPendingStatus_When_Created() {
        // given & when
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // then
        assertThat(session.getStatus()).isEqualTo(RedeemSessionStatus.PENDING);
        assertThat(session.isPending()).isTrue();
    }

    @Test
    @DisplayName("PENDING 상태의 세션 완료 성공")
    void should_CompleteSession_When_StatusIsPending() {
        // given
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when
        session.complete();

        // then
        assertThat(session.getStatus()).isEqualTo(RedeemSessionStatus.COMPLETED);
        assertThat(session.getCompletedAt()).isNotNull();
        assertThat(session.isPending()).isFalse();
    }

    @Test
    @DisplayName("PENDING 상태의 세션 만료 성공")
    void should_ExpireSession_When_StatusIsPending() {
        // given
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when
        session.expire();

        // then
        assertThat(session.getStatus()).isEqualTo(RedeemSessionStatus.EXPIRED);
        assertThat(session.isPending()).isFalse();
    }

    @Test
    @DisplayName("이미 완료된 세션은 다시 완료 불가")
    void should_ThrowException_When_CompleteAlreadyCompletedSession() {
        // given
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();
        session.complete();

        // when & then
        assertThatThrownBy(session::complete)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING sessions can be completed");
    }

    @Test
    @DisplayName("이미 만료된 세션은 완료 불가")
    void should_ThrowException_When_CompleteExpiredSession() {
        // given
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();
        session.expire();

        // when & then
        assertThatThrownBy(session::complete)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING sessions can be completed");
    }

    @Test
    @DisplayName("TTL 만료 시간이 지난 경우 만료된 것으로 판단")
    void should_ReturnExpired_When_ExpiresAtIsPast() {
        // given
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(1L)
                        .expiresAt(LocalDateTime.now().minusMinutes(1))
                        .build();

        // when & then
        assertThat(session.isExpired()).isTrue();
    }

    @Test
    @DisplayName("TTL 만료 시간 전에는 만료되지 않음")
    void should_ReturnNotExpired_When_ExpiresAtIsFuture() {
        // given
        RedeemSession session =
                RedeemSession.builder()
                        .walletRewardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when & then
        assertThat(session.isExpired()).isFalse();
    }
}
