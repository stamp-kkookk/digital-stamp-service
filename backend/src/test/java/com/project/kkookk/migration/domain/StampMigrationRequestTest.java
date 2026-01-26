package com.project.kkookk.migration.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class StampMigrationRequestTest {

    @Test
    @DisplayName("이전 요청 생성 시 기본 상태는 SUBMITTED")
    void should_CreateWithSubmittedStatus_When_Created() {
        // given & when
        StampMigrationRequest request =
                StampMigrationRequest.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .imageUrl("https://example.com/stamp.jpg")
                        .requestedAt(LocalDateTime.now())
                        .build();

        // then
        assertThat(request.getStatus()).isEqualTo(StampMigrationStatus.SUBMITTED);
        assertThat(request.isSubmitted()).isTrue();
    }

    @Test
    @DisplayName("SUBMITTED 상태의 요청 승인 성공")
    void should_ApproveRequest_When_StatusIsSubmitted() {
        // given
        StampMigrationRequest request =
                StampMigrationRequest.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .imageUrl("https://example.com/stamp.jpg")
                        .requestedAt(LocalDateTime.now())
                        .build();

        // when
        request.approve(10);

        // then
        assertThat(request.getStatus()).isEqualTo(StampMigrationStatus.APPROVED);
        assertThat(request.getApprovedStampCount()).isEqualTo(10);
        assertThat(request.getProcessedAt()).isNotNull();
        assertThat(request.isSubmitted()).isFalse();
    }

    @Test
    @DisplayName("SUBMITTED 상태의 요청 거절 성공")
    void should_RejectRequest_When_StatusIsSubmitted() {
        // given
        StampMigrationRequest request =
                StampMigrationRequest.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .imageUrl("https://example.com/stamp.jpg")
                        .requestedAt(LocalDateTime.now())
                        .build();

        // when
        request.reject("이미지가 불명확합니다");

        // then
        assertThat(request.getStatus()).isEqualTo(StampMigrationStatus.REJECTED);
        assertThat(request.getRejectReason()).isEqualTo("이미지가 불명확합니다");
        assertThat(request.getProcessedAt()).isNotNull();
        assertThat(request.isSubmitted()).isFalse();
    }

    @Test
    @DisplayName("SUBMITTED 상태의 요청 취소 성공")
    void should_CancelRequest_When_StatusIsSubmitted() {
        // given
        StampMigrationRequest request =
                StampMigrationRequest.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .imageUrl("https://example.com/stamp.jpg")
                        .requestedAt(LocalDateTime.now())
                        .build();

        // when
        request.cancel();

        // then
        assertThat(request.getStatus()).isEqualTo(StampMigrationStatus.CANCELED);
        assertThat(request.getProcessedAt()).isNotNull();
        assertThat(request.isSubmitted()).isFalse();
    }

    @Test
    @DisplayName("이미 승인된 요청은 다시 승인 불가")
    void should_ThrowException_When_ApproveAlreadyApprovedRequest() {
        // given
        StampMigrationRequest request =
                StampMigrationRequest.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .imageUrl("https://example.com/stamp.jpg")
                        .requestedAt(LocalDateTime.now())
                        .build();
        request.approve(10);

        // when & then
        assertThatThrownBy(() -> request.approve(5))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only SUBMITTED requests can be approved");
    }

    @Test
    @DisplayName("이미 거절된 요청은 승인 불가")
    void should_ThrowException_When_ApproveRejectedRequest() {
        // given
        StampMigrationRequest request =
                StampMigrationRequest.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .imageUrl("https://example.com/stamp.jpg")
                        .requestedAt(LocalDateTime.now())
                        .build();
        request.reject("불명확");

        // when & then
        assertThatThrownBy(() -> request.approve(5))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only SUBMITTED requests can be approved");
    }

    @Test
    @DisplayName("이미 취소된 요청은 거절 불가")
    void should_ThrowException_When_RejectCanceledRequest() {
        // given
        StampMigrationRequest request =
                StampMigrationRequest.builder()
                        .customerWalletId(1L)
                        .storeId(1L)
                        .imageUrl("https://example.com/stamp.jpg")
                        .requestedAt(LocalDateTime.now())
                        .build();
        request.cancel();

        // when & then
        assertThatThrownBy(() -> request.reject("사유"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only SUBMITTED requests can be rejected");
    }
}
