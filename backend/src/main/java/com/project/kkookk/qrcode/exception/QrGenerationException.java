package com.project.kkookk.qrcode.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class QrGenerationException extends BusinessException {
    public QrGenerationException() {
        super(ErrorCode.QR_GENERATION_FAILED);
    }
}
