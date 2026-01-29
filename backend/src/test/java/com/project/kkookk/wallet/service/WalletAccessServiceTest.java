package com.project.kkookk.wallet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.project.kkookk.customerstamp.domain.CustomerStampCard;
import com.project.kkookk.customerstamp.repository.CustomerStampCardRepository;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.dto.WalletAccessResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class WalletAccessServiceTest {

    @Mock private CustomerWalletRepository customerWalletRepository;

    @Mock private StoreRepository storeRepository;

    @Mock private CustomerStampCardRepository customerStampCardRepository;

    @InjectMocks private WalletAccessService walletAccessService;

    private CustomerWallet customerWallet;
    private Store store;
    private StampCard stampCard;
    private CustomerStampCard customerStampCard;

    @BeforeEach
    void setUp() {
        customerWallet =
                CustomerWallet.builder()
                        .phone("010-1234-5678")
                        .name("홍길동")
                        .nickname("테스트닉네임")
                        .build();
        ReflectionTestUtils.setField(customerWallet, "id", 1L);

        store = new Store("테스트 매장", "서울시 강남구", "123-45-67890", StoreStatus.ACTIVE, 1L);
        ReflectionTestUtils.setField(store, "id", 1L);

        stampCard =
                StampCard.builder()
                        .storeId(store.getId())
                        .title("테스트 스탬프 카드")
                        .goalStampCount(10)
                        .rewardName("아메리카노")
                        .build();
        ReflectionTestUtils.setField(stampCard, "id", 1L);

        customerStampCard = CustomerStampCard.of(customerWallet, store, stampCard);
        ReflectionTestUtils.setField(customerStampCard, "id", 1L);
    }

    @Test
    @DisplayName("지갑 정보 조회 성공 - 스탬프 카드가 있는 경우")
    void getWalletInfo_Success_WithStampCard() {
        // given
        given(customerWalletRepository.findByPhoneAndName(anyString(), anyString()))
                .willReturn(Optional.of(customerWallet));
        given(storeRepository.findById(anyLong())).willReturn(Optional.of(store));
        given(
                        customerStampCardRepository.findByCustomerWalletAndStore(
                                any(CustomerWallet.class), any(Store.class)))
                .willReturn(Optional.of(customerStampCard));

        // when
        WalletAccessResponse response =
                walletAccessService.getWalletInfo("010-1234-5678", "홍길동", 1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.userId()).isEqualTo(customerWallet.getId());
        assertThat(response.userName()).isEqualTo(customerWallet.getName());
        assertThat(response.stampCardInfo()).isNotNull();
        assertThat(response.stampCardInfo().stampCardId()).isEqualTo(customerStampCard.getId());

        verify(customerWalletRepository).findByPhoneAndName("010-1234-5678", "홍길동");
        verify(storeRepository).findById(1L);
        verify(customerStampCardRepository).findByCustomerWalletAndStore(customerWallet, store);
    }

    @Test
    @DisplayName("지갑 정보 조회 성공 - 스탬프 카드가 없는 경우")
    void getWalletInfo_Success_WithoutStampCard() {
        // given
        given(customerWalletRepository.findByPhoneAndName(anyString(), anyString()))
                .willReturn(Optional.of(customerWallet));
        given(storeRepository.findById(anyLong())).willReturn(Optional.of(store));
        given(
                        customerStampCardRepository.findByCustomerWalletAndStore(
                                any(CustomerWallet.class), any(Store.class)))
                .willReturn(Optional.empty());

        // when
        WalletAccessResponse response =
                walletAccessService.getWalletInfo("010-1234-5678", "홍길동", 1L);

        // then
        assertThat(response).isNotNull();
        assertThat(response.userId()).isEqualTo(customerWallet.getId());
        assertThat(response.userName()).isEqualTo(customerWallet.getName());
        assertThat(response.stampCardInfo()).isNull();

        verify(customerWalletRepository).findByPhoneAndName("010-1234-5678", "홍길동");
        verify(storeRepository).findById(1L);
        verify(customerStampCardRepository).findByCustomerWalletAndStore(customerWallet, store);
    }

    @Test
    @DisplayName("지갑 정보 조회 실패 - 지갑을 찾을 수 없음 (WALLET_NOT_FOUND)")
    void getWalletInfo_Fail_WalletNotFound() {
        // given
        given(customerWalletRepository.findByPhoneAndName(anyString(), anyString()))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> walletAccessService.getWalletInfo("010-9999-9999", "김철수", 1L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.WALLET_NOT_FOUND);
    }

    @Test
    @DisplayName("지갑 정보 조회 실패 - 매장을 찾을 수 없음 (STORE_NOT_FOUND)")
    void getWalletInfo_Fail_StoreNotFound() {
        // given
        given(customerWalletRepository.findByPhoneAndName(anyString(), anyString()))
                .willReturn(Optional.of(customerWallet));
        given(storeRepository.findById(anyLong())).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> walletAccessService.getWalletInfo("010-1234-5678", "홍길동", 999L))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.STORE_NOT_FOUND);
    }
}
