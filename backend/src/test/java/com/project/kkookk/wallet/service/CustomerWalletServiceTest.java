package com.project.kkookk.wallet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerWalletServiceTest {

    @InjectMocks private CustomerWalletService customerWalletService;

    @Mock private CustomerWalletRepository customerWalletRepository;

    @Mock private JwtUtil jwtUtil;

    @Test
    @DisplayName("지갑 생성 성공")
    void register_Success() {
        // given
        WalletRegisterRequest request = new WalletRegisterRequest("010-1234-5678", "홍길동", "길동이");

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("010-1234-5678").name("홍길동").nickname("길동이").build();

        // Reflection을 사용하여 ID 설정
        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedWallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        String expectedToken = "mock.jwt.token";

        given(customerWalletRepository.existsByPhone(request.phone())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(jwtUtil.generateCustomerAccessToken(anyLong(), anyString()))
                .willReturn(expectedToken);

        // when
        WalletRegisterResponse response = customerWalletService.register(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo(expectedToken);
        assertThat(response.walletId()).isEqualTo(1L);
        assertThat(response.phone()).isEqualTo("010-1234-5678");
        assertThat(response.name()).isEqualTo("홍길동");
        assertThat(response.nickname()).isEqualTo("길동이");

        verify(customerWalletRepository, times(1)).existsByPhone(request.phone());
        verify(customerWalletRepository, times(1)).save(any(CustomerWallet.class));
        verify(jwtUtil, times(1)).generateCustomerAccessToken(1L, "010-1234-5678");
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 중복")
    void register_Fail_PhoneDuplicated() {
        // given
        WalletRegisterRequest request = new WalletRegisterRequest("010-1234-5678", "홍길동", "길동이");

        given(customerWalletRepository.existsByPhone(request.phone())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> customerWalletService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_PHONE_DUPLICATED.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_PHONE_DUPLICATED);

        verify(customerWalletRepository, times(1)).existsByPhone(request.phone());
        verify(customerWalletRepository, never()).save(any(CustomerWallet.class));
        verify(jwtUtil, never()).generateCustomerAccessToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("생성된 지갑의 기본 상태는 ACTIVE")
    void register_DefaultStatus_Active() {
        // given
        WalletRegisterRequest request = new WalletRegisterRequest("010-9999-8888", "김철수", "철수");

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("010-9999-8888").name("김철수").nickname("철수").build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedWallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.existsByPhone(request.phone())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(jwtUtil.generateCustomerAccessToken(anyLong(), anyString())).willReturn("mock.token");

        // when
        WalletRegisterResponse response = customerWalletService.register(request);

        // then
        assertThat(savedWallet.getStatus()).isEqualTo(CustomerWalletStatus.ACTIVE);
        assertThat(savedWallet.isActive()).isTrue();
        assertThat(savedWallet.isBlocked()).isFalse();
        verify(customerWalletRepository, times(1)).save(any(CustomerWallet.class));
    }

    @Test
    @DisplayName("JWT 토큰에 walletId와 phone이 포함됨")
    void register_JwtToken_ContainsWalletIdAndPhone() {
        // given
        WalletRegisterRequest request = new WalletRegisterRequest("010-5555-6666", "이영희", "영희");

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("010-5555-6666").name("이영희").nickname("영희").build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedWallet, 99L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.existsByPhone(request.phone())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(jwtUtil.generateCustomerAccessToken(99L, "010-5555-6666"))
                .willReturn("token.with.walletId.and.phone");

        // when
        WalletRegisterResponse response = customerWalletService.register(request);

        // then
        assertThat(response.accessToken()).isEqualTo("token.with.walletId.and.phone");
        verify(jwtUtil, times(1)).generateCustomerAccessToken(99L, "010-5555-6666");
    }
}
