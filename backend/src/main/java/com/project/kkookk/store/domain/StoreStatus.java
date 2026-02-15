package com.project.kkookk.store.domain;

public enum StoreStatus {
    DRAFT,
    LIVE,
    SUSPENDED,
    DELETED;

    public boolean isOperational() {
        return this == LIVE;
    }
}
