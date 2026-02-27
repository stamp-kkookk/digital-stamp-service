package com.project.kkookk.issuance.event;

import com.project.kkookk.global.event.DomainEvent;
import java.time.LocalDateTime;
import java.util.UUID;

public record StampIssuedEvent(
        UUID eventId,
        Long aggregateId,
        Long storeId,
        Long stampCardId,
        Long walletStampCardId,
        int delta,
        String reason,
        Long issuanceRequestId,
        LocalDateTime occurredAt)
        implements DomainEvent {

    public StampIssuedEvent(
            Long issuanceRequestId,
            Long storeId,
            Long stampCardId,
            Long walletStampCardId,
            int delta,
            String reason) {
        this(
                UUID.randomUUID(),
                issuanceRequestId,
                storeId,
                stampCardId,
                walletStampCardId,
                delta,
                reason,
                issuanceRequestId,
                LocalDateTime.now());
    }

    @Override
    public String aggregateType() {
        return "IssuanceRequest";
    }
}
