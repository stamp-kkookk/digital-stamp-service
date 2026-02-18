package com.project.kkookk.wallet.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import com.project.kkookk.global.security.RefreshTokenService;
import com.project.kkookk.global.util.JwtUtil;
import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.CustomerWalletStatus;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.dto.WalletRegisterRequest;
import com.project.kkookk.wallet.dto.WalletRegisterResponse;
import com.project.kkookk.wallet.dto.response.RedeemEventHistoryResponse;
import com.project.kkookk.wallet.dto.response.StampEventHistoryResponse;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import com.project.kkookk.wallet.service.exception.WalletStampCardNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerWalletService 테스트")
class CustomerWalletServiceTest {

    @InjectMocks private CustomerWalletService customerWalletService;

    @Mock private CustomerWalletRepository customerWalletRepository;

    @Mock private WalletStampCardRepository walletStampCardRepository;

    @Mock private StampCardRepository stampCardRepository;

    @Mock private StoreRepository storeRepository;

    @Mock private StampEventRepository stampEventRepository;

    @Mock private RedeemEventRepository redeemEventRepository;

    @Mock private JwtUtil jwtUtil;

    @Mock private RefreshTokenService refreshTokenService;

    @Test
    @DisplayName("지갑 생성 성공")
    void register_Success() {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest("01012345678", "홍길동", "길동이", null);

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("01012345678").name("홍길동").nickname("길동이").build();

        // Reflection을 사용하여 ID 설정
        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedWallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        String expectedToken = "mock.jwt.token";

        given(customerWalletRepository.existsByPhone("01012345678")).willReturn(false);
        given(customerWalletRepository.existsByNickname(request.nickname())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(jwtUtil.generateCustomerToken(anyLong())).willReturn(expectedToken);
        given(refreshTokenService.issueCustomerRefreshToken(anyLong()))
                .willReturn("mock.refresh.token");

        // when
        WalletRegisterResponse response = customerWalletService.register(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo(expectedToken);
        assertThat(response.walletId()).isEqualTo(1L);
        assertThat(response.phone()).isEqualTo("01012345678");
        assertThat(response.name()).isEqualTo("홍길동");
        assertThat(response.nickname()).isEqualTo("길동이");

        verify(customerWalletRepository, times(1)).existsByPhone("01012345678");
        verify(customerWalletRepository, times(1)).existsByNickname(request.nickname());
        verify(customerWalletRepository, times(1)).save(any(CustomerWallet.class));
        verify(jwtUtil, times(1)).generateCustomerToken(1L);
    }

    @Test
    @DisplayName("지갑 생성 실패 - 전화번호 중복")
    void register_Fail_PhoneDuplicated() {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest("01012345678", "홍길동", "길동이", null);

        given(customerWalletRepository.existsByPhone("01012345678")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> customerWalletService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_PHONE_DUPLICATED.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_PHONE_DUPLICATED);

        verify(customerWalletRepository, times(1)).existsByPhone("01012345678");
        verify(customerWalletRepository, never()).save(any(CustomerWallet.class));
        verify(jwtUtil, never()).generateCustomerToken(anyLong());
    }

    @Test
    @DisplayName("생성된 지갑의 기본 상태는 ACTIVE")
    void register_DefaultStatus_Active() {
        // given
        WalletRegisterRequest request = new WalletRegisterRequest("01099998888", "김철수", "철수", null);

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("01099998888").name("김철수").nickname("철수").build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedWallet, 1L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.existsByPhone("01099998888")).willReturn(false);
        given(customerWalletRepository.existsByNickname(request.nickname())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(jwtUtil.generateCustomerToken(anyLong())).willReturn("mock.token");
        given(refreshTokenService.issueCustomerRefreshToken(anyLong()))
                .willReturn("mock.refresh.token");

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
        WalletRegisterRequest request = new WalletRegisterRequest("01055556666", "이영희", "영희", null);

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("01055556666").name("이영희").nickname("영희").build();

        try {
            java.lang.reflect.Field idField = CustomerWallet.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(savedWallet, 99L);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        given(customerWalletRepository.existsByPhone("01055556666")).willReturn(false);
        given(customerWalletRepository.existsByNickname(request.nickname())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(jwtUtil.generateCustomerToken(99L)).willReturn("token.with.walletId");
        given(refreshTokenService.issueCustomerRefreshToken(anyLong()))
                .willReturn("mock.refresh.token");

        // when
        WalletRegisterResponse response = customerWalletService.register(request);

        // then
        assertThat(response.accessToken()).isEqualTo("token.with.walletId");
        verify(jwtUtil, times(1)).generateCustomerToken(99L);
    }

    @Test
    @DisplayName("지갑 생성 성공 - storeId와 함께 생성 시 WalletStampCard 자동 발급")
    void register_Success_WithStoreId_CreatesWalletStampCard() {
        // given
        Long storeId = 10L;
        Long stampCardId = 100L;
        WalletRegisterRequest request =
                new WalletRegisterRequest("01011112222", "박영수", "영수", storeId);

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("01011112222").name("박영수").nickname("영수").build();
        ReflectionTestUtils.setField(savedWallet, "id", 1L);

        StampCard stampCard =
                StampCard.builder().storeId(storeId).title("아메리카노 10잔").goalStampCount(10).build();
        ReflectionTestUtils.setField(stampCard, "id", stampCardId);

        Store store = new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", null, null, null, 1L);
        ReflectionTestUtils.setField(store, "id", storeId);
        store.transitionTo(StoreStatus.LIVE);

        WalletStampCard savedWalletStampCard =
                WalletStampCard.builder()
                        .customerWalletId(1L)
                        .storeId(storeId)
                        .stampCardId(stampCardId)
                        .stampCount(0)
                        .build();
        ReflectionTestUtils.setField(savedWalletStampCard, "id", 50L);

        given(customerWalletRepository.existsByPhone("01011112222")).willReturn(false);
        given(customerWalletRepository.existsByNickname(request.nickname())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(
                        stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                storeId, StampCardStatus.ACTIVE))
                .willReturn(Optional.of(stampCard));
        given(storeRepository.findById(storeId)).willReturn(Optional.of(store));
        given(walletStampCardRepository.save(any(WalletStampCard.class)))
                .willReturn(savedWalletStampCard);
        given(jwtUtil.generateCustomerToken(anyLong())).willReturn("mock.token");
        given(refreshTokenService.issueCustomerRefreshToken(anyLong()))
                .willReturn("mock.refresh.token");

        // when
        WalletRegisterResponse response = customerWalletService.register(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.stampCard()).isNotNull();
        assertThat(response.stampCard().walletStampCardId()).isEqualTo(50L);
        assertThat(response.stampCard().title()).isEqualTo("아메리카노 10잔");
        assertThat(response.stampCard().storeName()).isEqualTo("꾹꾹 카페");
        verify(stampCardRepository)
                .findFirstByStoreIdAndStatusOrderByCreatedAtDesc(storeId, StampCardStatus.ACTIVE);
        verify(walletStampCardRepository).save(any(WalletStampCard.class));
    }

    @Test
    @DisplayName("지갑 생성 성공 - storeId가 있지만 ACTIVE 스탬프카드 없음")
    void register_Success_WithStoreId_NoActiveStampCard() {
        // given
        Long storeId = 10L;
        WalletRegisterRequest request =
                new WalletRegisterRequest("01033334444", "최민수", "민수", storeId);

        CustomerWallet savedWallet =
                CustomerWallet.builder().phone("01033334444").name("최민수").nickname("민수").build();
        ReflectionTestUtils.setField(savedWallet, "id", 1L);

        given(customerWalletRepository.existsByPhone("01033334444")).willReturn(false);
        given(customerWalletRepository.existsByNickname(request.nickname())).willReturn(false);
        given(customerWalletRepository.save(any(CustomerWallet.class))).willReturn(savedWallet);
        given(
                        stampCardRepository.findFirstByStoreIdAndStatusOrderByCreatedAtDesc(
                                storeId, StampCardStatus.ACTIVE))
                .willReturn(Optional.empty());
        given(jwtUtil.generateCustomerToken(anyLong())).willReturn("mock.token");
        given(refreshTokenService.issueCustomerRefreshToken(anyLong()))
                .willReturn("mock.refresh.token");

        // when
        WalletRegisterResponse response = customerWalletService.register(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.stampCard()).isNull();
        verify(stampCardRepository)
                .findFirstByStoreIdAndStatusOrderByCreatedAtDesc(storeId, StampCardStatus.ACTIVE);
        verify(walletStampCardRepository, never()).save(any(WalletStampCard.class));
    }

    @Test
    @DisplayName("스탬프 적립 히스토리 조회 성공 (storeId 기준)")
    void getStampHistoryByStore_Success() {
        // given
        Long storeId = 1L;
        Long walletId = 10L;
        Long walletStampCardId = 1L;
        Pageable pageable = PageRequest.of(0, 20);

        WalletStampCard walletStampCard =
                WalletStampCard.builder()
                        .customerWalletId(walletId)
                        .storeId(storeId)
                        .stampCardId(100L)
                        .stampCount(5)
                        .build();
        ReflectionTestUtils.setField(walletStampCard, "id", walletStampCardId);

        StampEvent event1 =
                StampEvent.builder()
                        .storeId(storeId)
                        .stampCardId(100L)
                        .walletStampCardId(walletStampCardId)
                        .type(StampEventType.ISSUED)
                        .delta(2)
                        .reason("아메리카노 2잔 구매")
                        .occurredAt(LocalDateTime.now())
                        .build();

        Page<StampEvent> eventPage = new PageImpl<>(List.of(event1), pageable, 1);

        given(walletStampCardRepository.existsByCustomerWalletIdAndStoreId(walletId, storeId))
                .willReturn(true);
        given(stampEventRepository.findByStoreIdAndWalletId(storeId, walletId, pageable))
                .willReturn(eventPage);

        // when
        StampEventHistoryResponse response =
                customerWalletService.getStampHistoryByStore(storeId, walletId, pageable);

        // then
        assertThat(response).isNotNull();
        assertThat(response.events()).hasSize(1);
        assertThat(response.events().get(0).type()).isEqualTo(StampEventType.ISSUED);
        assertThat(response.events().get(0).delta()).isEqualTo(2);
        assertThat(response.pageInfo().totalElements()).isEqualTo(1);

        verify(walletStampCardRepository).existsByCustomerWalletIdAndStoreId(walletId, storeId);
        verify(stampEventRepository).findByStoreIdAndWalletId(storeId, walletId, pageable);
    }

    @Test
    @DisplayName("스탬프 적립 히스토리 조회 실패 - 해당 매장의 스탬프카드 없음")
    void getStampHistoryByStore_Fail_NotFound() {
        // given
        Long storeId = 1L;
        Long walletId = 10L;
        Pageable pageable = PageRequest.of(0, 20);

        given(walletStampCardRepository.existsByCustomerWalletIdAndStoreId(walletId, storeId))
                .willReturn(false);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerWalletService.getStampHistoryByStore(
                                        storeId, walletId, pageable))
                .isInstanceOf(WalletStampCardNotFoundException.class)
                .hasMessageContaining("해당 매장의 스탬프카드를 찾을 수 없습니다");

        verify(walletStampCardRepository).existsByCustomerWalletIdAndStoreId(walletId, storeId);
    }

    @Test
    @DisplayName("리워드 사용 히스토리 조회 성공 (storeId 기준)")
    void getRedeemHistoryByStore_Success() {
        // given
        Long storeId = 10L;
        Long walletId = 1L;
        Pageable pageable = PageRequest.of(0, 20);

        RedeemEvent event1 =
                RedeemEvent.builder()
                        .walletRewardId(100L)
                        .walletId(walletId)
                        .storeId(storeId)
                        .result(RedeemEventResult.SUCCESS)
                        .occurredAt(LocalDateTime.now())
                        .build();

        Page<RedeemEvent> eventPage = new PageImpl<>(List.of(event1), pageable, 1);

        Store store = new Store("꾹꾹 카페", "서울시 강남구", "02-1234-5678", null, null, null, 1L);
        ReflectionTestUtils.setField(store, "id", storeId);
        store.transitionTo(StoreStatus.LIVE);

        given(walletStampCardRepository.existsByCustomerWalletIdAndStoreId(walletId, storeId))
                .willReturn(true);
        given(
                        redeemEventRepository.findByStoreIdAndWalletIdOrderByOccurredAtDesc(
                                storeId, walletId, pageable))
                .willReturn(eventPage);
        given(storeRepository.findById(storeId)).willReturn(Optional.of(store));

        // when
        RedeemEventHistoryResponse response =
                customerWalletService.getRedeemHistoryByStore(storeId, walletId, pageable);

        // then
        assertThat(response).isNotNull();
        assertThat(response.events()).hasSize(1);
        assertThat(response.events().get(0).result()).isEqualTo(RedeemEventResult.SUCCESS);
        assertThat(response.events().get(0).store().storeName()).isEqualTo("꾹꾹 카페");
        assertThat(response.pageInfo().totalElements()).isEqualTo(1);

        verify(walletStampCardRepository).existsByCustomerWalletIdAndStoreId(walletId, storeId);
        verify(redeemEventRepository)
                .findByStoreIdAndWalletIdOrderByOccurredAtDesc(storeId, walletId, pageable);
        verify(storeRepository).findById(storeId);
    }

    @Test
    @DisplayName("리워드 사용 히스토리 조회 실패 - 해당 매장의 스탬프카드 없음")
    void getRedeemHistoryByStore_Fail_NotFound() {
        // given
        Long storeId = 10L;
        Long walletId = 1L;
        Pageable pageable = PageRequest.of(0, 20);

        given(walletStampCardRepository.existsByCustomerWalletIdAndStoreId(walletId, storeId))
                .willReturn(false);

        // when & then
        assertThatThrownBy(
                        () ->
                                customerWalletService.getRedeemHistoryByStore(
                                        storeId, walletId, pageable))
                .isInstanceOf(WalletStampCardNotFoundException.class)
                .hasMessageContaining("해당 매장의 스탬프카드를 찾을 수 없습니다");

        verify(walletStampCardRepository).existsByCustomerWalletIdAndStoreId(walletId, storeId);
    }

    @Test
    @DisplayName("지갑 생성 실패 - 닉네임 중복")
    void register_Fail_NicknameDuplicated() {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest("01012345678", "홍길동", "길동이", null);

        given(customerWalletRepository.existsByPhone("01012345678")).willReturn(false);
        given(customerWalletRepository.existsByNickname(request.nickname())).willReturn(true);

        // when & then
        assertThatThrownBy(() -> customerWalletService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_NICKNAME_DUPLICATED.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_NICKNAME_DUPLICATED);

        verify(customerWalletRepository, times(1)).existsByPhone("01012345678");
        verify(customerWalletRepository, times(1)).existsByNickname(request.nickname());
        verify(customerWalletRepository, never()).save(any(CustomerWallet.class));
    }

    @Test
    @DisplayName("지갑 생성 실패 - 닉네임 중복 (Race condition: DB 유니크 제약 위반)")
    void register_Fail_NicknameDuplicated_RaceCondition() {
        // given
        WalletRegisterRequest request =
                new WalletRegisterRequest("01012345678", "홍길동", "길동이", null);

        given(customerWalletRepository.existsByPhone("01012345678")).willReturn(false);
        // 첫 번째 호출(사전 체크): false, 두 번째 호출(catch 블록 재검사): true
        given(customerWalletRepository.existsByNickname(request.nickname()))
                .willReturn(false)
                .willReturn(true);
        given(customerWalletRepository.save(any(CustomerWallet.class)))
                .willThrow(new DataIntegrityViolationException("Duplicate entry for nickname"));

        // when & then
        assertThatThrownBy(() -> customerWalletService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.WALLET_NICKNAME_DUPLICATED.getMessage())
                .extracting("errorCode")
                .isEqualTo(ErrorCode.WALLET_NICKNAME_DUPLICATED);

        verify(customerWalletRepository, times(1)).save(any(CustomerWallet.class));
        verify(customerWalletRepository, times(2)).existsByNickname(request.nickname());
    }

    @Test
    @DisplayName("닉네임 사용 가능 여부 체크 - 사용 가능")
    void checkNicknameAvailable_Available() {
        // given
        given(customerWalletRepository.existsByNickname("새닉네임")).willReturn(false);

        // when
        boolean available = customerWalletService.checkNicknameAvailable("새닉네임");

        // then
        assertThat(available).isTrue();
        verify(customerWalletRepository).existsByNickname("새닉네임");
    }

    @Test
    @DisplayName("닉네임 사용 가능 여부 체크 - 이미 사용 중")
    void checkNicknameAvailable_Duplicated() {
        // given
        given(customerWalletRepository.existsByNickname("길동이")).willReturn(true);

        // when
        boolean available = customerWalletService.checkNicknameAvailable("길동이");

        // then
        assertThat(available).isFalse();
        verify(customerWalletRepository).existsByNickname("길동이");
    }

    @Test
    @DisplayName("고객 로그인 실패 - 지갑을 찾을 수 없음")
    void login_Fail_WalletNotFound() {
        // given
        com.project.kkookk.wallet.dto.CustomerLoginRequest request =
                new com.project.kkookk.wallet.dto.CustomerLoginRequest(
                        "010-9999-9999", "존재하지않음", 1L);

        given(customerWalletRepository.findByPhoneAndName("01099999999", "존재하지않음"))
                .willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> customerWalletService.login(request))
                .isInstanceOf(
                        com.project.kkookk.wallet.service.exception.CustomerWalletNotFoundException
                                .class)
                .hasMessageContaining("해당 전화번호와 이름으로 지갑을 찾을 수 없습니다");

        verify(customerWalletRepository).findByPhoneAndName("01099999999", "존재하지않음");
        verify(jwtUtil, never()).generateCustomerToken(anyLong());
    }

    @Test
    @DisplayName("고객 로그인 실패 - 차단된 지갑")
    void login_Fail_WalletBlocked() {
        // given
        com.project.kkookk.wallet.dto.CustomerLoginRequest request =
                new com.project.kkookk.wallet.dto.CustomerLoginRequest("010-1234-5678", "홍길동", 1L);

        CustomerWallet blockedWallet =
                CustomerWallet.builder().phone("01012345678").name("홍길동").nickname("길동이").build();
        ReflectionTestUtils.setField(blockedWallet, "id", 1L);
        blockedWallet.block();

        given(customerWalletRepository.findByPhoneAndName("01012345678", "홍길동"))
                .willReturn(Optional.of(blockedWallet));

        // when & then
        assertThatThrownBy(() -> customerWalletService.login(request))
                .isInstanceOf(
                        com.project.kkookk.wallet.service.exception.CustomerWalletBlockedException
                                .class)
                .hasMessageContaining("차단된 지갑입니다");

        verify(customerWalletRepository).findByPhoneAndName("01012345678", "홍길동");
        verify(jwtUtil, never()).generateCustomerToken(anyLong());
    }
}
