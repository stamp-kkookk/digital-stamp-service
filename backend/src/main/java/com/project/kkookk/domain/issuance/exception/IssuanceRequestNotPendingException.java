package com.project.kkookk.domain.issuance.exception;

import com.project.kkookk.common.exception.BusinessException;
import com.project.kkookk.common.exception.ErrorCode;

public class IssuanceRequestNotPendingException extends BusinessException {
    public IssuanceRequestNotPendingException() {
        super(ErrorCode.ISSUANCE_REQUEST_NOT_PENDING);
    }
}
