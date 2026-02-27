package com.project.kkookk.redeem.event;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;

import com.project.kkookk.redeem.domain.RedeemEventResult;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RedeemAuditEventListenerTest {

    @InjectMocks private RedeemAuditEventListener listener;
    @Mock private RedeemEventRepository redeemEventRepository;

    @Test
    @DisplayName("RewardRedeemedEvent 수신 시 RedeemEvent 생성")
    void onRewardRedeemed_createsRedeemEvent() {
        // given
        RewardRedeemedEvent event =
                new RewardRedeemedEvent(10L, 1L, 100L, RedeemEventResult.SUCCESS);

        // when
        listener.onRewardRedeemed(event);

        // then
        verify(redeemEventRepository)
                .save(
                        argThat(
                                e ->
                                        e.getWalletRewardId().equals(10L)
                                                && e.getWalletId().equals(1L)
                                                && e.getStoreId().equals(100L)
                                                && e.getResult() == RedeemEventResult.SUCCESS));
    }
}
