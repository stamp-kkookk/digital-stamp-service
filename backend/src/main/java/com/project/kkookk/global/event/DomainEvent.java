package com.project.kkookk.global.event;

import java.time.LocalDateTime;
import java.util.UUID;

public interface DomainEvent {
    UUID eventId();

    String aggregateType();

    Long aggregateId();

    LocalDateTime occurredAt();
}
