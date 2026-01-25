package com.project.kkookk.common.exception;

public class QrGenerationException extends BusinessException {
    public QrGenerationException() {
        super(ErrorCode.QR_GENERATION_FAILED);
    }
}
