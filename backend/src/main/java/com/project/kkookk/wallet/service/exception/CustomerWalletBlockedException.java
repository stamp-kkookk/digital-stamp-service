package com.project.kkookk.wallet.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class CustomerWalletBlockedException extends BusinessException {

    public CustomerWalletBlockedException() {
        super(ErrorCode.CUSTOMER_WALLET_BLOCKED);
    }

    public CustomerWalletBlockedException(String message) {
        super(ErrorCode.CUSTOMER_WALLET_BLOCKED, message);
    }
}
