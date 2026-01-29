package com.project.kkookk.store.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class StoreNotFoundException extends BusinessException {

    public StoreNotFoundException() {
        super(ErrorCode.STORE_NOT_FOUND);
    }

    public StoreNotFoundException(String message) {
        super(ErrorCode.STORE_NOT_FOUND, message);
    }
}
