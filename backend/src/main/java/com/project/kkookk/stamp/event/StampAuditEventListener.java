package com.project.kkookk.stamp.event;

import com.project.kkookk.issuance.event.StampIssuedEvent;
import com.project.kkookk.migration.event.StampMigratedEvent;
import com.project.kkookk.stamp.domain.StampEvent;
import com.project.kkookk.stamp.domain.StampEventType;
import com.project.kkookk.stamp.repository.StampEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class StampAuditEventListener {

    private final StampEventRepository stampEventRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onStampIssued(StampIssuedEvent event) {
        StampEvent stampEvent =
                StampEvent.builder()
                        .storeId(event.storeId())
                        .stampCardId(event.stampCardId())
                        .walletStampCardId(event.walletStampCardId())
                        .type(StampEventType.ISSUED)
                        .delta(event.delta())
                        .reason(event.reason())
                        .occurredAt(event.occurredAt())
                        .issuanceRequestId(event.issuanceRequestId())
                        .build();
        stampEventRepository.save(stampEvent);
        log.info("[Audit] StampEvent recorded: eventId={}, type=ISSUED", event.eventId());
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void onStampMigrated(StampMigratedEvent event) {
        StampEvent stampEvent =
                StampEvent.builder()
                        .storeId(event.storeId())
                        .stampCardId(event.stampCardId())
                        .walletStampCardId(event.walletStampCardId())
                        .type(StampEventType.MIGRATED)
                        .delta(event.delta())
                        .reason(event.reason())
                        .occurredAt(event.occurredAt())
                        .stampMigrationRequestId(event.stampMigrationRequestId())
                        .build();
        stampEventRepository.save(stampEvent);
        log.info("[Audit] StampEvent recorded: eventId={}, type=MIGRATED", event.eventId());
    }
}
