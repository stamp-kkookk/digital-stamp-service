package com.kkookk.integration;

import com.kkookk.common.exception.BusinessException;
import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.customer.entity.SessionScope;
import com.kkookk.customer.entity.WalletStampCard;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.customer.repository.CustomerWalletRepository;
import com.kkookk.customer.repository.WalletStampCardRepository;
import com.kkookk.owner.entity.OwnerAccount;
import com.kkookk.owner.repository.OwnerAccountRepository;
import com.kkookk.redemption.dto.CreateRedeemSessionRequest;
import com.kkookk.redemption.dto.RedeemSessionResponse;
import com.kkookk.redemption.entity.RedeemEvent;
import com.kkookk.redemption.entity.RewardInstance;
import com.kkookk.redemption.entity.RewardStatus;
import com.kkookk.redemption.repository.RedeemEventRepository;
import com.kkookk.redemption.repository.RewardInstanceRepository;
import com.kkookk.redemption.service.RedemptionService;
import com.kkookk.stampcard.entity.StampCard;
import com.kkookk.stampcard.entity.StampCardStatus;
import com.kkookk.stampcard.repository.StampCardRepository;
import com.kkookk.store.entity.Store;
import com.kkookk.store.repository.StoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
public class RedemptionFlowTest {

    @Autowired
    private RedemptionService redemptionService;

    @Autowired
    private OwnerAccountRepository ownerAccountRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private StampCardRepository stampCardRepository;

    @Autowired
    private CustomerWalletRepository walletRepository;

    @Autowired
    private CustomerSessionRepository sessionRepository;

    @Autowired
    private WalletStampCardRepository walletStampCardRepository;

    @Autowired
    private RewardInstanceRepository rewardInstanceRepository;

    @Autowired
    private RedeemEventRepository redeemEventRepository;

    private OwnerAccount owner;
    private Store store;
    private StampCard stampCard;
    private CustomerWallet wallet;
    private CustomerSession session;
    private RewardInstance reward;

    @BeforeEach
    public void setup() {
        // Owner & Store 생성
        owner = OwnerAccount.builder()
                .email("test@example.com")
                .passwordHash("hash")
                .name("Test Owner")
                .build();
        owner = ownerAccountRepository.save(owner);

        store = Store.builder()
                .owner(owner)
                .name("Test Store")
                .build();
        store = storeRepository.save(store);

        // StampCard 생성
        stampCard = StampCard.builder()
                .store(store)
                .title("Test Stamp Card")
                .status(StampCardStatus.ACTIVE)
                .stampGoal(10)
                .rewardName("Free Coffee")
                .build();
        stampCard = stampCardRepository.save(stampCard);

        // Customer Wallet & Session 생성
        wallet = CustomerWallet.builder()
                .phoneNumber("01012345678")
                .name("Test Customer")
                .nickname("Tester")
                .build();
        wallet = walletRepository.save(wallet);

        session = CustomerSession.builder()
                .wallet(wallet)
                .sessionToken(UUID.randomUUID().toString())
                .scope(SessionScope.FULL)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .otpVerifiedUntil(LocalDateTime.now().plusMinutes(10)) // Step-up valid
                .build();
        session = sessionRepository.save(session);

        // WalletStampCard 생성 (목표 달성)
        WalletStampCard walletStampCard = WalletStampCard.builder()
                .wallet(wallet)
                .stampCard(stampCard)
                .stampCount(10)
                .build();
        walletStampCard = walletStampCardRepository.save(walletStampCard);

        // RewardInstance 생성
        reward = RewardInstance.builder()
                .wallet(wallet)
                .store(store)
                .stampCard(stampCard)
                .walletStampCard(walletStampCard)
                .rewardName("Free Coffee")
                .status(RewardStatus.AVAILABLE)
                .build();
        reward = rewardInstanceRepository.save(reward);
    }

    @Test
    public void testRedemptionFlow_stepUpValid_createSession_complete_rewardUsed_eventLogged_idempotent() {
        // Given: Step-up이 유효한 상태
        assertThat(session.getOtpVerifiedUntil()).isAfter(LocalDateTime.now());

        // When: RedeemSession 생성
        CreateRedeemSessionRequest request = CreateRedeemSessionRequest.builder()
                .rewardId(reward.getId())
                .clientRequestId(UUID.randomUUID().toString())
                .build();

        RedeemSessionResponse sessionResponse = redemptionService.createRedeemSession(
                session.getSessionToken(), request);

        assertThat(sessionResponse.getSessionToken()).isNotNull();
        assertThat(sessionResponse.getRewardId()).isEqualTo(reward.getId());

        // And: Complete 호출
        RedeemSessionResponse completeResponse = redemptionService.completeRedemption(
                sessionResponse.getSessionToken());

        // Then: Reward 상태가 USED로 변경
        RewardInstance updatedReward = rewardInstanceRepository.findById(reward.getId()).orElseThrow();
        assertThat(updatedReward.getStatus()).isEqualTo(RewardStatus.USED);

        // And: RedeemEvent가 기록됨
        List<RedeemEvent> events = redeemEventRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
        assertThat(events).hasSize(1);
        assertThat(events.get(0).getRewardName()).isEqualTo("Free Coffee");

        // And: 중복 호출 시 동일 결과 반환 (멱등성)
        RedeemSessionResponse idempotentResponse = redemptionService.completeRedemption(
                sessionResponse.getSessionToken());
        assertThat(idempotentResponse.getSessionToken()).isEqualTo(completeResponse.getSessionToken());

        // And: 이벤트는 1개만 존재 (중복 방지)
        List<RedeemEvent> eventsAfterRetry = redeemEventRepository.findByWalletIdOrderByCreatedAtDesc(
                wallet.getId());
        assertThat(eventsAfterRetry).hasSize(1);
    }
}
