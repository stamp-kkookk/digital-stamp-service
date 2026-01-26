package com.project.kkookk.service.stampcard.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class StampCardNotFoundException extends BusinessException {

    public StampCardNotFoundException() {
        super(ErrorCode.STAMP_CARD_NOT_FOUND);
    }
}
