package com.project.kkookk.redeem.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class RedeemEventTest {

    @Test
    @DisplayName("리딤 이벤트 생성 시 발생 시각 자동 설정")
    void should_SetOccurredAtAutomatically_When_NotProvided() {
        // given
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);

        // when
        RedeemEvent event =
                RedeemEvent.builder()
                        .walletRewardId(1L)
                        .walletId(1L)
                        .storeId(1L)
                        .result(RedeemEventResult.SUCCESS)
                        .build();

        // then
        LocalDateTime after = LocalDateTime.now().plusSeconds(1);
        assertThat(event.getOccurredAt()).isNotNull();
        assertThat(event.getOccurredAt()).isAfter(before);
        assertThat(event.getOccurredAt()).isBefore(after);
    }

    @Test
    @DisplayName("리딤 이벤트 생성 시 발생 시각 명시적 설정 가능")
    void should_UseProvidedOccurredAt_When_Provided() {
        // given
        LocalDateTime specificTime = LocalDateTime.of(2024, 1, 15, 10, 30, 0);

        // when
        RedeemEvent event =
                RedeemEvent.builder()
                        .walletRewardId(1L)
                        .walletId(1L)
                        .storeId(1L)
                        .result(RedeemEventResult.SUCCESS)
                        .occurredAt(specificTime)
                        .build();

        // then
        assertThat(event.getOccurredAt()).isEqualTo(specificTime);
    }

    @Test
    @DisplayName("성공 리딤 이벤트 생성")
    void should_CreateSuccessEvent_When_ResultIsSuccess() {
        // given & when
        RedeemEvent event =
                RedeemEvent.builder()
                        .walletRewardId(1L)
                        .walletId(1L)
                        .storeId(1L)
                        .result(RedeemEventResult.SUCCESS)
                        .build();

        // then
        assertThat(event.getWalletRewardId()).isEqualTo(1L);
        assertThat(event.getResult()).isEqualTo(RedeemEventResult.SUCCESS);
    }

    @Test
    @DisplayName("FAILED 결과의 리딤 이벤트 생성")
    void should_CreateFailedEvent_When_ResultIsFailed() {
        // given & when
        RedeemEvent event =
                RedeemEvent.builder()
                        .walletRewardId(1L)
                        .walletId(1L)
                        .storeId(1L)
                        .result(RedeemEventResult.FAILED)
                        .build();

        // then
        assertThat(event.getResult()).isEqualTo(RedeemEventResult.FAILED);
    }
}
