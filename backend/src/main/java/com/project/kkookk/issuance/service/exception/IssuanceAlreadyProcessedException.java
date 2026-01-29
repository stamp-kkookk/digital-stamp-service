package com.project.kkookk.issuance.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class IssuanceAlreadyProcessedException extends BusinessException {

    public IssuanceAlreadyProcessedException() {
        super(ErrorCode.ISSUANCE_ALREADY_PROCESSED);
    }
}
