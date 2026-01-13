package com.kkookk.integration;

import com.kkookk.customer.entity.CustomerSession;
import com.kkookk.customer.entity.CustomerWallet;
import com.kkookk.customer.entity.SessionScope;
import com.kkookk.customer.entity.WalletStampCard;
import com.kkookk.customer.repository.CustomerSessionRepository;
import com.kkookk.customer.repository.CustomerWalletRepository;
import com.kkookk.customer.repository.WalletStampCardRepository;
import com.kkookk.issuance.dto.CreateIssuanceRequest;
import com.kkookk.issuance.dto.IssuanceRequestResponse;
import com.kkookk.issuance.entity.IssuanceRequestStatus;
import com.kkookk.issuance.entity.StampEvent;
import com.kkookk.issuance.entity.StampEventType;
import com.kkookk.issuance.repository.StampEventRepository;
import com.kkookk.issuance.service.IssuanceService;
import com.kkookk.owner.entity.OwnerAccount;
import com.kkookk.owner.repository.OwnerAccountRepository;
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

@SpringBootTest
@Transactional
public class IssuanceFlowTest {

    @Autowired
    private IssuanceService issuanceService;

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
    private StampEventRepository stampEventRepository;

    private OwnerAccount owner;
    private Store store;
    private StampCard stampCard;
    private CustomerWallet wallet;
    private CustomerSession session;

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
                .build();
        session = sessionRepository.save(session);
    }

    @Test
    public void testIssuanceFlow_createRequest_ownerApproves_stampCountIncreases_eventLogged() {
        // Given: 적립 요청 생성
        CreateIssuanceRequest request = CreateIssuanceRequest.builder()
                .storeId(store.getId())
                .clientRequestId(UUID.randomUUID().toString())
                .build();

        IssuanceRequestResponse issuanceResponse = issuanceService.createIssuanceRequest(
                session.getSessionToken(), request);

        assertThat(issuanceResponse.getStatus()).isEqualTo(IssuanceRequestStatus.PENDING.name());

        // When: Owner가 승인
        IssuanceRequestResponse approvedResponse = issuanceService.approveRequest(issuanceResponse.getId());

        // Then: 상태가 APPROVED로 변경
        assertThat(approvedResponse.getStatus()).isEqualTo(IssuanceRequestStatus.APPROVED.name());

        // And: WalletStampCard의 stampCount가 1 증가
        WalletStampCard walletStampCard = walletStampCardRepository
                .findByWalletIdAndStampCardId(wallet.getId(), stampCard.getId())
                .orElseThrow();
        assertThat(walletStampCard.getStampCount()).isEqualTo(1);

        // And: StampEvent가 기록됨 (type=ISSUED, delta=+1)
        List<StampEvent> events = stampEventRepository.findByWalletStampCardIdOrderByCreatedAtDesc(
                walletStampCard.getId());
        assertThat(events).hasSize(1);
        assertThat(events.get(0).getEventType()).isEqualTo(StampEventType.ISSUED);
        assertThat(events.get(0).getStampDelta()).isEqualTo(1);
    }
}
