package com.project.kkookk.wallet.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CustomerWalletTest {

    @Test
    @DisplayName("고객 지갑 생성 시 기본 상태는 ACTIVE")
    void should_CreateWithActiveStatus_When_StatusNotProvided() {
        // given & when
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-1234-5678").name("홍길동").nickname("길동이").build();

        // then
        assertThat(wallet.getStatus()).isEqualTo(CustomerWalletStatus.ACTIVE);
        assertThat(wallet.isActive()).isTrue();
        assertThat(wallet.isBlocked()).isFalse();
    }

    @Test
    @DisplayName("고객 지갑 생성 시 상태를 명시적으로 설정 가능")
    void should_CreateWithGivenStatus_When_StatusProvided() {
        // given & when
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동이")
                        .status(CustomerWalletStatus.BLOCKED)
                        .build();

        // then
        assertThat(wallet.getStatus()).isEqualTo(CustomerWalletStatus.BLOCKED);
        assertThat(wallet.isBlocked()).isTrue();
        assertThat(wallet.isActive()).isFalse();
    }

    @Test
    @DisplayName("고객 지갑 차단 성공")
    void should_BlockWallet_When_BlockMethodCalled() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder().phone("010-1234-5678").name("홍길동").nickname("길동이").build();

        // when
        wallet.block();

        // then
        assertThat(wallet.getStatus()).isEqualTo(CustomerWalletStatus.BLOCKED);
        assertThat(wallet.isBlocked()).isTrue();
        assertThat(wallet.isActive()).isFalse();
    }

    @Test
    @DisplayName("차단된 지갑 활성화 성공")
    void should_ActivateWallet_When_ActivateMethodCalled() {
        // given
        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동이")
                        .status(CustomerWalletStatus.BLOCKED)
                        .build();

        // when
        wallet.activate();

        // then
        assertThat(wallet.getStatus()).isEqualTo(CustomerWalletStatus.ACTIVE);
        assertThat(wallet.isActive()).isTrue();
        assertThat(wallet.isBlocked()).isFalse();
    }
}
