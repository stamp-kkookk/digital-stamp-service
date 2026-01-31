package com.project.kkookk.issuance.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class IssuanceRequestNotFoundException extends BusinessException {

    public IssuanceRequestNotFoundException() {
        super(ErrorCode.ISSUANCE_REQUEST_NOT_FOUND);
    }
}
