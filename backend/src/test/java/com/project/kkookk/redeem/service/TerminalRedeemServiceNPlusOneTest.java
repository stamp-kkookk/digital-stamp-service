package com.project.kkookk.redeem.service;

import com.project.kkookk.owner.domain.OwnerAccount;
import com.project.kkookk.owner.repository.OwnerAccountRepository;
import com.project.kkookk.redeem.domain.RedeemSession;
import com.project.kkookk.redeem.repository.RedeemSessionRepository;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.repository.StampCardRepository;
import com.project.kkookk.store.domain.Store;
import com.project.kkookk.store.domain.StoreStatus;
import com.project.kkookk.store.repository.StoreRepository;
import com.project.kkookk.wallet.domain.CustomerWallet;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.repository.CustomerWalletRepository;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TerminalRedeemServiceNPlusOneTest {

    @Autowired private TerminalRedeemService terminalRedeemService;

    @Autowired private OwnerAccountRepository ownerAccountRepository;

    @Autowired private StoreRepository storeRepository;

    @Autowired private StampCardRepository stampCardRepository;

    @Autowired private CustomerWalletRepository customerWalletRepository;

    @Autowired private WalletRewardRepository walletRewardRepository;

    @Autowired private RedeemSessionRepository redeemSessionRepository;

    @Autowired private EntityManager entityManager;

    private Long ownerId;
    private Long storeId;
    private Statistics statistics;

    @BeforeEach
    void setUp() {
        // Hibernate Statistics 설정
        SessionFactory sessionFactory =
                entityManager.getEntityManagerFactory().unwrap(SessionFactory.class);
        statistics = sessionFactory.getStatistics();
        statistics.setStatisticsEnabled(true);

        // 1. Owner 생성
        OwnerAccount owner =
                OwnerAccount.builder()
                        .email("test@test.com")
                        .passwordHash("hashedpassword")
                        .phoneNumber("010-1234-5678")
                        .build();
        ownerAccountRepository.save(owner);
        ownerId = owner.getId();

        // 2. Store 생성
        Store store = new Store("테스트 매장", "주소", "010-1234-5678", StoreStatus.ACTIVE, ownerId);
        storeRepository.save(store);
        storeId = store.getId();

        // 3. StampCard 생성
        StampCard stampCard =
                StampCard.builder()
                        .storeId(storeId)
                        .title("테스트 스탬프카드")
                        .goalStampCount(10)
                        .rewardName("무료 음료")
                        .build();
        stampCardRepository.save(stampCard);

        // 4. 10명의 Customer + WalletReward + RedeemSession 생성
        for (int i = 1; i <= 10; i++) {
            CustomerWallet wallet =
                    CustomerWallet.builder()
                            .phone("010-0000-00" + String.format("%02d", i))
                            .name("고객" + i)
                            .nickname("닉네임" + i)
                            .build();
            customerWalletRepository.save(wallet);

            WalletReward reward =
                    WalletReward.builder()
                            .walletId(wallet.getId())
                            .storeId(storeId)
                            .stampCardId(stampCard.getId())
                            .issuedAt(LocalDateTime.now())
                            .expiresAt(LocalDateTime.now().plusDays(30))
                            .build();
            walletRewardRepository.save(reward);

            // status를 REDEEMING으로 변경
            reward.startRedeeming();

            RedeemSession session =
                    RedeemSession.builder()
                            .walletRewardId(reward.getId())
                            .expiresAt(LocalDateTime.now().plusMinutes(5))
                            .build();
            redeemSessionRepository.save(session);
        }

        // 영속성 컨텍스트 초기화 (1차 캐시 비움)
        entityManager.flush();
        entityManager.clear();

        // 통계 초기화 (setUp 쿼리 제외)
        statistics.clear();
    }

    @Test
    @DisplayName("N+1 문제 확인 - PENDING 세션 10개 조회 시 쿼리 수 측정")
    void checkNPlusOneProblem() {
        System.out.println("\n");
        System.out.println("=".repeat(60));
        System.out.println("========== N+1 쿼리 테스트 시작 ==========");
        System.out.println("=".repeat(60));
        System.out.println("\n");

        // 서비스 메서드 호출
        terminalRedeemService.getPendingRedeemSessions(storeId, ownerId);

        // 쿼리 수 측정
        long queryCount = statistics.getPrepareStatementCount();

        System.out.println("\n");
        System.out.println("=".repeat(60));
        System.out.println("========== N+1 쿼리 테스트 종료 ==========");
        System.out.println("=".repeat(60));
        System.out.println("\n");

        System.out.println("=".repeat(60));
        System.out.println("📊 쿼리 실행 통계");
        System.out.println("=".repeat(60));
        System.out.println("총 쿼리 수: " + queryCount);
        System.out.println("=".repeat(60));
        System.out.println("\n");
        System.out.println("N+1 문제가 있으면: 약 23개 이상 (2 + 10 + 10 + 1)");
        System.out.println("N+1 해결 후: 5개 (store + session + reward + wallet + stampCard)");
        System.out.println("\n");
    }
}
