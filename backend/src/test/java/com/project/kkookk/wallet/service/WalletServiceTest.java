package com.project.kkookk.wallet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.otp.controller.dto.OtpVerifyRequest;
import com.project.kkookk.otp.controller.dto.OtpVerifyResponse;
import com.project.kkookk.otp.service.OtpService;
import com.project.kkookk.wallet.controller.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.controller.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock private CustomerWalletRepository customerWalletRepository;

    @Mock private OtpService otpService;

    @InjectMocks private WalletService walletService;

    @Test
    @DisplayName("OTP 검증 성공 후 지갑 생성 성공")
    void registerWallet_Success() {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "test-verification-id",
                        "123456",
                        "홍길동",
                        "길동이");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class)))
                .willReturn(OtpVerifyResponse.of(true, "010-1234-5678"));

        given(customerWalletRepository.existsByPhone("010-1234-5678")).willReturn(false);

        CustomerWallet savedWallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동이")
                        .status(CustomerWalletStatus.ACTIVE)
                        .build();
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);

        // when
        WalletRegisterResponse response = walletService.registerWallet(request);

        // then
        assertThat(response.phone()).isEqualTo("010-1234-5678");
        assertThat(response.name()).isEqualTo("홍길동");
        assertThat(response.nickname()).isEqualTo("길동이");
        assertThat(response.status()).isEqualTo(CustomerWalletStatus.ACTIVE);

        verify(otpService).verifyOtp(any(OtpVerifyRequest.class));
        verify(customerWalletRepository).existsByPhone("010-1234-5678");
        verify(customerWalletRepository).save(any(CustomerWallet.class));
    }

    @Test
    @DisplayName("OTP 검증 실패 시 예외 발생")
    void registerWallet_OtpVerificationFailed() {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "test-verification-id",
                        "123456",
                        "홍길동",
                        "길동이");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class)))
                .willReturn(OtpVerifyResponse.of(false, "010-1234-5678"));

        // when & then
        assertThatThrownBy(() -> walletService.registerWallet(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.OTP_VERIFICATION_FAILED);

        verify(otpService).verifyOtp(any(OtpVerifyRequest.class));
        verify(customerWalletRepository, never()).existsByPhone(any());
        verify(customerWalletRepository, never()).save(any());
    }

    @Test
    @DisplayName("전화번호 중복 시 예외 발생")
    void registerWallet_PhoneDuplicated() {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest(
                        "010-1234-5678",
                        "test-verification-id",
                        "123456",
                        "홍길동",
                        "길동이");

        given(otpService.verifyOtp(any(OtpVerifyRequest.class)))
                .willReturn(OtpVerifyResponse.of(true, "010-1234-5678"));

        given(customerWalletRepository.existsByPhone("010-1234-5678")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> walletService.registerWallet(request))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WALLET_PHONE_DUPLICATED);

        verify(otpService).verifyOtp(any(OtpVerifyRequest.class));
        verify(customerWalletRepository).existsByPhone("010-1234-5678");
        verify(customerWalletRepository, never()).save(any());
    }
}
