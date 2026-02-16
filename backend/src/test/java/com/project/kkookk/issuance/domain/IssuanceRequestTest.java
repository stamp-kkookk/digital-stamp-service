package com.project.kkookk.issuance.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class IssuanceRequestTest {

    @Test
    @DisplayName("적립 요청 생성 시 기본 상태는 PENDING")
    void should_CreateWithPendingStatus_When_Created() {
        // given & when
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // then
        assertThat(request.getStatus()).isEqualTo(IssuanceRequestStatus.PENDING);
        assertThat(request.isPending()).isTrue();
    }

    @Test
    @DisplayName("PENDING 상태의 요청 승인 성공")
    void should_ApproveRequest_When_StatusIsPending() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when
        request.approve(1);

        // then
        assertThat(request.getStatus()).isEqualTo(IssuanceRequestStatus.APPROVED);
        assertThat(request.getApprovedAt()).isNotNull();
        assertThat(request.getRewardsIssued()).isEqualTo(1);
        assertThat(request.isPending()).isFalse();
    }

    @Test
    @DisplayName("PENDING 상태의 요청 거절 성공")
    void should_RejectRequest_When_StatusIsPending() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when
        request.reject();

        // then
        assertThat(request.getStatus()).isEqualTo(IssuanceRequestStatus.REJECTED);
        assertThat(request.isPending()).isFalse();
    }

    @Test
    @DisplayName("PENDING 상태의 요청 만료 성공")
    void should_ExpireRequest_When_StatusIsPending() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when
        request.expire();

        // then
        assertThat(request.getStatus()).isEqualTo(IssuanceRequestStatus.EXPIRED);
        assertThat(request.isPending()).isFalse();
    }

    @Test
    @DisplayName("이미 승인된 요청은 다시 승인 불가")
    void should_ThrowException_When_ApproveAlreadyApprovedRequest() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();
        request.approve(0);

        // when & then
        assertThatThrownBy(() -> request.approve(0))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING requests can be approved");
    }

    @Test
    @DisplayName("이미 거절된 요청은 승인 불가")
    void should_ThrowException_When_ApproveRejectedRequest() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();
        request.reject();

        // when & then
        assertThatThrownBy(() -> request.approve(0))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING requests can be approved");
    }

    @Test
    @DisplayName("PENDING 상태의 요청 취소 성공")
    void should_CancelRequest_When_StatusIsPending() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when
        request.cancel();

        // then
        assertThat(request.getStatus()).isEqualTo(IssuanceRequestStatus.CANCELLED);
        assertThat(request.isPending()).isFalse();
    }

    @Test
    @DisplayName("이미 승인된 요청은 취소 불가")
    void should_ThrowException_When_CancelAlreadyApprovedRequest() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();
        request.approve(0);

        // when & then
        assertThatThrownBy(() -> request.cancel())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING requests can be cancelled");
    }

    @Test
    @DisplayName("이미 거절된 요청은 취소 불가")
    void should_ThrowException_When_CancelRejectedRequest() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();
        request.reject();

        // when & then
        assertThatThrownBy(() -> request.cancel())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING requests can be cancelled");
    }

    @Test
    @DisplayName("TTL 만료 시간이 지난 경우 만료된 것으로 판단")
    void should_ReturnExpired_When_ExpiresAtIsPast() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().minusMinutes(1))
                        .build();

        // when & then
        assertThat(request.isExpired()).isTrue();
    }

    @Test
    @DisplayName("TTL 만료 시간 전에는 만료되지 않음")
    void should_ReturnNotExpired_When_ExpiresAtIsFuture() {
        // given
        IssuanceRequest request =
                IssuanceRequest.builder()
                        .storeId(1L)
                        .walletId(1L)
                        .walletStampCardId(1L)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .build();

        // when & then
        assertThat(request.isExpired()).isFalse();
    }
}
