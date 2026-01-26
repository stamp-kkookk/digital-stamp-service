package com.project.kkookk.service.stampcard.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class StampCardUpdateNotAllowedException extends BusinessException {

    public StampCardUpdateNotAllowedException() {
        super(ErrorCode.STAMP_CARD_UPDATE_NOT_ALLOWED);
    }
}
