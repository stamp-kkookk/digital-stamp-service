package com.project.kkookk.wallet.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class WalletStampCardNotFoundException extends BusinessException {

    public WalletStampCardNotFoundException() {
        super(ErrorCode.WALLET_STAMP_CARD_NOT_FOUND);
    }

    public WalletStampCardNotFoundException(String message) {
        super(ErrorCode.WALLET_STAMP_CARD_NOT_FOUND, message);
    }
}
