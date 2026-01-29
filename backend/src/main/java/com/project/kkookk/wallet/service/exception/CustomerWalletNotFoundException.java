package com.project.kkookk.wallet.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class CustomerWalletNotFoundException extends BusinessException {

    public CustomerWalletNotFoundException() {
        super(ErrorCode.CUSTOMER_WALLET_NOT_FOUND);
    }

    public CustomerWalletNotFoundException(String message) {
        super(ErrorCode.CUSTOMER_WALLET_NOT_FOUND, message);
    }
}
