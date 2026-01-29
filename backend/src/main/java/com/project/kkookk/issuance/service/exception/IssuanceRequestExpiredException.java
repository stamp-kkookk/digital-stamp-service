package com.project.kkookk.issuance.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class IssuanceRequestExpiredException extends BusinessException {

    public IssuanceRequestExpiredException() {
        super(ErrorCode.ISSUANCE_REQUEST_EXPIRED);
    }
}
