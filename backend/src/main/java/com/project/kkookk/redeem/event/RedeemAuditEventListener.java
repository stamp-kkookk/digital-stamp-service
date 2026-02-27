package com.project.kkookk.redeem.event;

import com.project.kkookk.redeem.domain.RedeemEvent;
import com.project.kkookk.redeem.repository.RedeemEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedeemAuditEventListener {

    private final RedeemEventRepository redeemEventRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onRewardRedeemed(RewardRedeemedEvent event) {
        RedeemEvent redeemEvent =
                RedeemEvent.builder()
                        .walletRewardId(event.walletRewardId())
                        .walletId(event.walletId())
                        .storeId(event.storeId())
                        .result(event.result())
                        .build();
        redeemEventRepository.save(redeemEvent);
        log.info(
                "[Audit] RedeemEvent recorded: eventId={}, result={}",
                event.eventId(),
                event.result());
    }
}
