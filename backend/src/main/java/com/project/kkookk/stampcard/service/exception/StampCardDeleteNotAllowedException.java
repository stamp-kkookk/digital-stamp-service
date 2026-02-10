package com.project.kkookk.stampcard.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class StampCardDeleteNotAllowedException extends BusinessException {

    public StampCardDeleteNotAllowedException() {
        super(ErrorCode.STAMP_CARD_DELETE_NOT_ALLOWED);
    }
}
