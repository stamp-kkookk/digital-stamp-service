package com.project.kkookk.common.limit.domain;

import java.time.LocalDateTime;
import java.util.Objects;

public class FailureRecord {
    private final String identifier;
    private final int failureCount;
    private final LocalDateTime blockedUntil;
    private final LocalDateTime lastFailureAt;

    public FailureRecord(String identifier, int failureCount, LocalDateTime blockedUntil, LocalDateTime lastFailureAt) {
        this.identifier = identifier;
        this.failureCount = failureCount;
        this.blockedUntil = blockedUntil;
        this.lastFailureAt = lastFailureAt;
    }

    public static FailureRecord initialRecord(String identifier) {
        return new FailureRecord(identifier, 1, null, LocalDateTime.now());
    }

    public FailureRecord incrementFailureCount() {
        return new FailureRecord(this.identifier, this.failureCount + 1, this.blockedUntil, LocalDateTime.now());
    }

    public FailureRecord block(LocalDateTime blockedUntil) {
        return new FailureRecord(this.identifier, this.failureCount, blockedUntil, this.lastFailureAt);
    }

    public boolean isBlocked() {
        return this.blockedUntil != null && LocalDateTime.now().isBefore(this.blockedUntil);
    }

    public String getIdentifier() {
        return identifier;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public LocalDateTime getBlockedUntil() {
        return blockedUntil;
    }

    public LocalDateTime getLastFailureAt() {
        return lastFailureAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FailureRecord that = (FailureRecord) o;
        return failureCount == that.failureCount &&
               Objects.equals(identifier, that.identifier) &&
               Objects.equals(blockedUntil, that.blockedUntil) &&
               Objects.equals(lastFailureAt, that.lastFailureAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(identifier, failureCount, blockedUntil, lastFailureAt);
    }

    @Override
    public String toString() {
        return "FailureRecord{"
               + "identifier='" + identifier + "'"
               + ", failureCount=" + failureCount
               + ", blockedUntil=" + blockedUntil
               + ", lastFailureAt=" + lastFailureAt
               + "}";
    }
}
