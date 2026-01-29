package com.project.kkookk.issuance.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class IssuanceRequestAlreadyPendingException extends BusinessException {

    public IssuanceRequestAlreadyPendingException() {
        super(ErrorCode.ISSUANCE_REQUEST_ALREADY_PENDING);
    }
}
