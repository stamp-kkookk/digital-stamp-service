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
import com.project.kkookk.wallet.dto.WalletAccessRequest;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import java.util.Optional;
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
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-1234-5678", "홍길동", "길동이");

        CustomerWallet savedWallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동이")
                        .build();

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
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-1234-5678", "홍길동", "길동이");

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
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-9999-8888", "김철수", "철수");

        CustomerWallet savedWallet =
                CustomerWallet.builder()
                        .phone("010-9999-8888")
                        .name("김철수")
                        .nickname("철수")
                        .build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedWallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.existsByPhone(request.phone())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(jwtUtil.generateCustomerAccessToken(anyLong(), anyString()))
                .willReturn("mock.token");

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
        WalletRegisterRequest request =
                new WalletRegisterRequest("010-5555-6666", "이영희", "영희");

        CustomerWallet savedWallet =
                CustomerWallet.builder()
                        .phone("010-5555-6666")
                        .name("이영희")
                        .nickname("영희")
                        .build();

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

    @Test
    @DisplayName("지갑 접근 성공")
    void accessWallet_Success() {
        // given
        WalletAccessRequest request = new WalletAccessRequest("010-1234-5678", "홍길동");

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동이")
                        .build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(wallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.findByPhone("010-1234-5678"))
                .willReturn(Optional.of(wallet));

        // when
        WalletAccessResponse response = customerWalletService.accessWallet(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.walletId()).isEqualTo(1L);
        assertThat(response.phone()).isEqualTo("010-1234-5678");
        assertThat(response.name()).isEqualTo("홍길동");
        assertThat(response.nickname()).isEqualTo("길동이");

        verify(customerWalletRepository, times(1)).findByPhone("010-1234-5678");
    }

    @Test
    @DisplayName("지갑 접근 성공 - Phone 정규화 (하이픈 제거)")
    void accessWallet_Success_PhoneNormalization() {
        // given
        WalletAccessRequest request = new WalletAccessRequest("010-1234-5678", "홍길동");

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("01012345678") // DB에는 하이픈 없이 저장됨
                        .name("홍길동")
                        .nickname("길동이")
                        .build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(wallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.findByPhone("010-1234-5678"))
                .willReturn(Optional.empty());
        given(customerWalletRepository.findByPhone("01012345678"))
                .willReturn(Optional.of(wallet));

        // when
        WalletAccessResponse response = customerWalletService.accessWallet(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.walletId()).isEqualTo(1L);
        assertThat(response.phone()).isEqualTo("01012345678");

        verify(customerWalletRepository, times(1)).findByPhone("010-1234-5678");
        verify(customerWalletRepository, times(1)).findByPhone("01012345678");
    }

    @Test
    @DisplayName("지갑 접근 성공 - Name 대소문자 무시")
    void accessWallet_Success_NameCaseInsensitive() {
        // given
        WalletAccessRequest request = new WalletAccessRequest("010-1234-5678", "홍길동");

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동") // DB에는 대소문자 구분 없이 저장됨
                        .nickname("길동이")
                        .build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(wallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.findByPhone("010-1234-5678"))
                .willReturn(Optional.of(wallet));

        // when
        WalletAccessResponse response = customerWalletService.accessWallet(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("홍길동");
    }

    @Test
    @DisplayName("지갑 접근 실패 - Rate Limit 초과")
    void accessWallet_Fail_RateLimitExceeded() {
        // given
        WalletAccessRequest request = new WalletAccessRequest("010-1234-5678", "홍길동");

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동이")
                        .build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(wallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.findByPhone("010-1234-5678"))
                .willReturn(Optional.of(wallet));

        // when - 첫 번째 요청 성공
        customerWalletService.accessWallet(request);

        // when & then - 60초 이내 재요청 시 Rate Limit 발생
        assertThatThrownBy(() -> customerWalletService.accessWallet(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_ACCESS_RATE_LIMIT_EXCEEDED.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_ACCESS_RATE_LIMIT_EXCEEDED);
    }

    @Test
    @DisplayName("지갑 접근 실패 - 지갑 없음 (Phone 불일치)")
    void accessWallet_Fail_WalletNotFound_Phone() {
        // given
        WalletAccessRequest request = new WalletAccessRequest("010-9999-9999", "홍길동");

        given(customerWalletRepository.findByPhone("010-9999-9999"))
                .willReturn(Optional.empty());
        given(customerWalletRepository.findByPhone("01099999999")).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> customerWalletService.accessWallet(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_NOT_FOUND.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_NOT_FOUND);

        verify(customerWalletRepository, times(1)).findByPhone("010-9999-9999");
        verify(customerWalletRepository, times(1)).findByPhone("01099999999");
    }

    @Test
    @DisplayName("지갑 접근 실패 - Name 불일치")
    void accessWallet_Fail_WalletNotFound_Name() {
        // given
        WalletAccessRequest request = new WalletAccessRequest("010-1234-5678", "김철수");

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동") // 이름이 다름
                        .nickname("길동이")
                        .build();

        given(customerWalletRepository.findByPhone("010-1234-5678"))
                .willReturn(Optional.of(wallet));

        // when & then
        assertThatThrownBy(() -> customerWalletService.accessWallet(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_NOT_FOUND.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_NOT_FOUND);

        verify(customerWalletRepository, times(1)).findByPhone("010-1234-5678");
    }

    @Test
    @DisplayName("지갑 접근 실패 - 차단된 지갑")
    void accessWallet_Fail_WalletBlocked() {
        // given
        WalletAccessRequest request = new WalletAccessRequest("010-1234-5678", "홍길동");

        CustomerWallet wallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("길동이")
                        .status(CustomerWalletStatus.BLOCKED)
                        .build();

        given(customerWalletRepository.findByPhone("010-1234-5678"))
                .willReturn(Optional.of(wallet));

        // when & then
        assertThatThrownBy(() -> customerWalletService.accessWallet(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_BLOCKED.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_BLOCKED);

        verify(customerWalletRepository, times(1)).findByPhone("010-1234-5678");
    }
}
