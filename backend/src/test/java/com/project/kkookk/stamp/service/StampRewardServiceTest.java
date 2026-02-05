package com.project.kkookk.stamp.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.project.kkookk.stamp.service.StampRewardService.StampAccumulationResult;
import com.project.kkookk.stampcard.domain.StampCard;
import com.project.kkookk.stampcard.domain.StampCardStatus;
import com.project.kkookk.wallet.domain.WalletReward;
import com.project.kkookk.wallet.domain.WalletStampCard;
import com.project.kkookk.wallet.repository.WalletRewardRepository;
import com.project.kkookk.wallet.repository.WalletStampCardRepository;
import java.lang.reflect.Field;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StampRewardServiceTest {

    @InjectMocks private StampRewardService stampRewardService;

    @Mock private WalletRewardRepository walletRewardRepository;
    @Mock private WalletStampCardRepository walletStampCardRepository;

    @Captor private ArgumentCaptor<List<WalletReward>> rewardsCaptor;

    @Nested
    @DisplayName("스탬프 적립 및 리워드 발급")
    class ProcessStampAccumulation {

        @Test
        @DisplayName("리워드 미달 - 스탬프만 증가")
        void noReward_StampIncrease() {
            // given
            WalletStampCard walletStampCard = createWalletStampCard(1L, 100L, 1L, 10L, 3);
            StampCard stampCard = createStampCard(10L, 1L, 10, 30);

            // when
            StampAccumulationResult result =
                    stampRewardService.processStampAccumulation(walletStampCard, stampCard, 2);

            // then
            assertThat(result.issuedRewards()).isEmpty();
            assertThat(result.currentWalletStampCard()).isSameAs(walletStampCard);
            assertThat(walletStampCard.getStampCount()).isEqualTo(5); // 3 + 2 = 5
            assertThat(walletStampCard.isActive()).isTrue();
            verify(walletRewardRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("리워드 1개 발급 - 정확히 목표 도달")
        void oneReward_ExactGoal() {
            // given
            WalletStampCard walletStampCard = createWalletStampCard(1L, 100L, 1L, 10L, 8);
            StampCard stampCard = createStampCard(10L, 1L, 10, 30);

            given(walletRewardRepository.saveAll(anyList())).willAnswer(i -> i.getArgument(0));
            given(walletStampCardRepository.save(any(WalletStampCard.class)))
                    .willAnswer(
                            i -> {
                                WalletStampCard saved = i.getArgument(0);
                                setId(saved, 2L); // 새 WalletStampCard ID
                                return saved;
                            });

            // when
            StampAccumulationResult result =
                    stampRewardService.processStampAccumulation(walletStampCard, stampCard, 2);

            // then
            assertThat(result.issuedRewards()).hasSize(1);
            assertThat(result.rewardCount()).isEqualTo(1);
            // 기존 카드는 COMPLETED
            assertThat(walletStampCard.getStampCount()).isEqualTo(10); // goalStampCount
            assertThat(walletStampCard.isActive()).isFalse();
            // 새 카드 생성 (remainder = 0)
            assertThat(result.currentWalletStampCard()).isNotSameAs(walletStampCard);
            assertThat(result.currentWalletStampCard().getStampCount()).isEqualTo(0);
            assertThat(result.currentWalletStampCard().isActive()).isTrue();
            verify(walletRewardRepository).saveAll(rewardsCaptor.capture());
            assertThat(rewardsCaptor.getValue()).hasSize(1);
        }

        @Test
        @DisplayName("리워드 1개 발급 - 초과분 이월")
        void oneReward_WithRemainder() {
            // given
            WalletStampCard walletStampCard = createWalletStampCard(1L, 100L, 1L, 10L, 8);
            StampCard stampCard = createStampCard(10L, 1L, 10, 30);

            given(walletRewardRepository.saveAll(anyList())).willAnswer(i -> i.getArgument(0));
            given(walletStampCardRepository.save(any(WalletStampCard.class)))
                    .willAnswer(
                            i -> {
                                WalletStampCard saved = i.getArgument(0);
                                setId(saved, 2L);
                                return saved;
                            });

            // when
            StampAccumulationResult result =
                    stampRewardService.processStampAccumulation(walletStampCard, stampCard, 5);

            // then
            assertThat(result.issuedRewards()).hasSize(1);
            // 기존 카드는 COMPLETED
            assertThat(walletStampCard.isActive()).isFalse();
            // 새 카드에 초과분 이월 (8 + 5) % 10 = 3
            assertThat(result.currentWalletStampCard().getStampCount()).isEqualTo(3);
            assertThat(result.currentWalletStampCard().isActive()).isTrue();
        }

        @Test
        @DisplayName("리워드 3개 발급 - 대량 마이그레이션")
        void multipleRewards_BulkMigration() {
            // given
            WalletStampCard walletStampCard = createWalletStampCard(1L, 100L, 1L, 10L, 8);
            StampCard stampCard = createStampCard(10L, 1L, 10, 30);

            given(walletRewardRepository.saveAll(anyList())).willAnswer(i -> i.getArgument(0));
            given(walletStampCardRepository.save(any(WalletStampCard.class)))
                    .willAnswer(
                            i -> {
                                WalletStampCard saved = i.getArgument(0);
                                setId(saved, 2L);
                                return saved;
                            });

            // when
            StampAccumulationResult result =
                    stampRewardService.processStampAccumulation(walletStampCard, stampCard, 25);

            // then
            assertThat(result.issuedRewards()).hasSize(3); // (8 + 25) / 10 = 3
            assertThat(result.rewardCount()).isEqualTo(3);
            // 기존 카드는 COMPLETED
            assertThat(walletStampCard.isActive()).isFalse();
            // 새 카드에 초과분 이월 (8 + 25) % 10 = 3
            assertThat(result.currentWalletStampCard().getStampCount()).isEqualTo(3);
            verify(walletRewardRepository).saveAll(rewardsCaptor.capture());
            assertThat(rewardsCaptor.getValue()).hasSize(3);
        }

        @Test
        @DisplayName("리워드 발급 - 만료일 설정")
        void reward_WithExpireDays() {
            // given
            WalletStampCard walletStampCard = createWalletStampCard(1L, 100L, 1L, 10L, 9);
            StampCard stampCard = createStampCard(10L, 1L, 10, 30);

            given(walletRewardRepository.saveAll(anyList())).willAnswer(i -> i.getArgument(0));
            given(walletStampCardRepository.save(any(WalletStampCard.class)))
                    .willAnswer(
                            i -> {
                                WalletStampCard saved = i.getArgument(0);
                                setId(saved, 2L);
                                return saved;
                            });

            // when
            StampAccumulationResult result =
                    stampRewardService.processStampAccumulation(walletStampCard, stampCard, 1);

            // then
            assertThat(result.issuedRewards()).hasSize(1);
            assertThat(result.issuedRewards().get(0).getExpiresAt()).isNotNull();
            assertThat(result.issuedRewards().get(0).getExpiresAt())
                    .isAfter(result.issuedRewards().get(0).getIssuedAt().plusDays(29));
        }

        @Test
        @DisplayName("리워드 발급 - 무기한 (expireDays null)")
        void reward_NoExpiration() {
            // given
            WalletStampCard walletStampCard = createWalletStampCard(1L, 100L, 1L, 10L, 9);
            StampCard stampCard = createStampCard(10L, 1L, 10, null);

            given(walletRewardRepository.saveAll(anyList())).willAnswer(i -> i.getArgument(0));
            given(walletStampCardRepository.save(any(WalletStampCard.class)))
                    .willAnswer(
                            i -> {
                                WalletStampCard saved = i.getArgument(0);
                                setId(saved, 2L);
                                return saved;
                            });

            // when
            StampAccumulationResult result =
                    stampRewardService.processStampAccumulation(walletStampCard, stampCard, 1);

            // then
            assertThat(result.issuedRewards()).hasSize(1);
            assertThat(result.issuedRewards().get(0).getExpiresAt()).isNull();
        }

        @Test
        @DisplayName("스탬프 0개 추가 - 변화 없음")
        void zeroDelta_NoChange() {
            // given
            WalletStampCard walletStampCard = createWalletStampCard(1L, 100L, 1L, 10L, 5);
            StampCard stampCard = createStampCard(10L, 1L, 10, 30);

            // when
            StampAccumulationResult result =
                    stampRewardService.processStampAccumulation(walletStampCard, stampCard, 0);

            // then
            assertThat(result.issuedRewards()).isEmpty();
            assertThat(result.currentWalletStampCard()).isSameAs(walletStampCard);
            assertThat(walletStampCard.getStampCount()).isEqualTo(5);
            assertThat(walletStampCard.isActive()).isTrue();
            verify(walletRewardRepository, never()).saveAll(anyList());
        }
    }

    private WalletStampCard createWalletStampCard(
            Long id, Long walletId, Long storeId, Long stampCardId, int stampCount) {
        WalletStampCard wsc =
                WalletStampCard.builder()
                        .customerWalletId(walletId)
                        .storeId(storeId)
                        .stampCardId(stampCardId)
                        .stampCount(stampCount)
                        .build();
        setId(wsc, id);
        return wsc;
    }

    private StampCard createStampCard(
            Long id, Long storeId, int goalStampCount, Integer expireDays) {
        StampCard card =
                StampCard.builder()
                        .storeId(storeId)
                        .title("테스트 스탬프 카드")
                        .goalStampCount(goalStampCount)
                        .rewardName("아메리카노")
                        .rewardQuantity(1)
                        .expireDays(expireDays)
                        .build();
        setId(card, id);
        card.updateStatus(StampCardStatus.ACTIVE);
        return card;
    }

    private void setId(Object entity, Long id) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(entity, id);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Failed to set id field", e);
        }
    }
}
