package com.project.kkookk.migration.event;

import com.project.kkookk.global.event.DomainEvent;
import java.time.LocalDateTime;
import java.util.UUID;

public record StampMigratedEvent(
        UUID eventId,
        Long aggregateId,
        Long storeId,
        Long stampCardId,
        Long walletStampCardId,
        int delta,
        String reason,
        Long stampMigrationRequestId,
        LocalDateTime occurredAt)
        implements DomainEvent {

    public StampMigratedEvent(
            Long stampMigrationRequestId,
            Long storeId,
            Long stampCardId,
            Long walletStampCardId,
            int delta,
            String reason) {
        this(
                UUID.randomUUID(),
                stampMigrationRequestId,
                storeId,
                stampCardId,
                walletStampCardId,
                delta,
                reason,
                stampMigrationRequestId,
                LocalDateTime.now());
    }

    @Override
    public String aggregateType() {
        return "StampMigrationRequest";
    }
}
