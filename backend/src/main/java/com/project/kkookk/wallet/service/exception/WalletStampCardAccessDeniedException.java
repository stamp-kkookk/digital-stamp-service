package com.project.kkookk.wallet.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class WalletStampCardAccessDeniedException extends BusinessException {

    public WalletStampCardAccessDeniedException() {
        super(ErrorCode.WALLET_STAMP_CARD_ACCESS_DENIED);
    }

    public WalletStampCardAccessDeniedException(String message) {
        super(ErrorCode.WALLET_STAMP_CARD_ACCESS_DENIED, message);
    }
}
