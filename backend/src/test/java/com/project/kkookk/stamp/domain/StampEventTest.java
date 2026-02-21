package com.project.kkookk.stamp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StampEventTest {

    @Test
    @DisplayName("스탬프 이벤트 생성 시 발생 시각 자동 설정")
    void should_SetOccurredAtAutomatically_When_NotProvided() {
        // given
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);

        // when
        StampEvent event =
                StampEvent.builder()
                        .storeId(1L)
                        .stampCardId(1L)
                        .walletStampCardId(1L)
                        .type(StampEventType.ISSUED)
                        .delta(1)
                        .build();

        // then
        LocalDateTime after = LocalDateTime.now().plusSeconds(1);
        assertThat(event.getOccurredAt()).isNotNull();
        assertThat(event.getOccurredAt()).isAfter(before);
        assertThat(event.getOccurredAt()).isBefore(after);
    }

    @Test
    @DisplayName("스탬프 이벤트 생성 시 발생 시각 명시적 설정 가능")
    void should_UseProvidedOccurredAt_When_Provided() {
        // given
        LocalDateTime specificTime = LocalDateTime.of(2024, 1, 15, 10, 30, 0);

        // when
        StampEvent event =
                StampEvent.builder()
                        .storeId(1L)
                        .stampCardId(1L)
                        .walletStampCardId(1L)
                        .type(StampEventType.ISSUED)
                        .delta(1)
                        .occurredAt(specificTime)
                        .build();

        // then
        assertThat(event.getOccurredAt()).isEqualTo(specificTime);
    }

    @Test
    @DisplayName("ISSUED 타입의 스탬프 이벤트 생성")
    void should_CreateIssuedEvent_When_TypeIsIssued() {
        // given & when
        StampEvent event =
                StampEvent.builder()
                        .storeId(1L)
                        .stampCardId(1L)
                        .walletStampCardId(1L)
                        .type(StampEventType.ISSUED)
                        .delta(1)
                        .issuanceRequestId(100L)
                        .build();

        // then
        assertThat(event.getType()).isEqualTo(StampEventType.ISSUED);
        assertThat(event.getDelta()).isEqualTo(1);
        assertThat(event.getIssuanceRequestId()).isEqualTo(100L);
    }

    @Test
    @DisplayName("MIGRATED 타입의 스탬프 이벤트 생성")
    void should_CreateMigratedEvent_When_TypeIsMigrated() {
        // given & when
        StampEvent event =
                StampEvent.builder()
                        .storeId(1L)
                        .stampCardId(1L)
                        .walletStampCardId(1L)
                        .type(StampEventType.MIGRATED)
                        .delta(10)
                        .stampMigrationRequestId(200L)
                        .reason("종이 스탬프 이전")
                        .build();

        // then
        assertThat(event.getType()).isEqualTo(StampEventType.MIGRATED);
        assertThat(event.getDelta()).isEqualTo(10);
        assertThat(event.getStampMigrationRequestId()).isEqualTo(200L);
        assertThat(event.getReason()).isEqualTo("종이 스탬프 이전");
    }

    @Test
    @DisplayName("MANUAL_ADJUST 타입의 스탬프 이벤트 생성 (음수 delta)")
    void should_CreateManualAdjustEvent_When_TypeIsManualAdjust() {
        // given & when
        StampEvent event =
                StampEvent.builder()
                        .storeId(1L)
                        .stampCardId(1L)
                        .walletStampCardId(1L)
                        .type(StampEventType.MANUAL_ADJUST)
                        .delta(-3)
                        .reason("중복 적립 취소")
                        .build();

        // then
        assertThat(event.getType()).isEqualTo(StampEventType.MANUAL_ADJUST);
        assertThat(event.getDelta()).isEqualTo(-3);
        assertThat(event.getReason()).isEqualTo("중복 적립 취소");
    }
}
