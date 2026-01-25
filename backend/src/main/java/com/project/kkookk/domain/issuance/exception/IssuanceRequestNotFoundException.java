package com.project.kkookk.domain.issuance.exception;

import com.project.kkookk.common.exception.BusinessException;
import com.project.kkookk.common.exception.ErrorCode;

public class IssuanceRequestNotFoundException extends BusinessException {
    public IssuanceRequestNotFoundException() {
        super(ErrorCode.ISSUANCE_REQUEST_NOT_FOUND);
    }
}
