package com.project.kkookk.common.limit.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;
import java.time.Duration;

public class BlockedException extends BusinessException {
    private final int failureCount;
    private final Duration blockedDuration;

    public BlockedException(ErrorCode errorCode, int failureCount, Duration blockedDuration) {
        super(errorCode);
        this.failureCount = failureCount;
        this.blockedDuration = blockedDuration;
    }

    public BlockedException(ErrorCode errorCode, String message, int failureCount, Duration blockedDuration) {
        super(errorCode, message);
        this.failureCount = failureCount;
        this.blockedDuration = blockedDuration;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public Duration getBlockedDuration() {
        return blockedDuration;
    }
}
