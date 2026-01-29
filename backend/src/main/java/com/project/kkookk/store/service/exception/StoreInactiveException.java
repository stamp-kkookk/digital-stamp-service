package com.project.kkookk.store.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class StoreInactiveException extends BusinessException {

    public StoreInactiveException() {
        super(ErrorCode.STORE_INACTIVE);
    }

    public StoreInactiveException(String message) {
        super(ErrorCode.STORE_INACTIVE, message);
    }
}
