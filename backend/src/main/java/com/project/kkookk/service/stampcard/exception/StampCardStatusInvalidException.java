package com.project.kkookk.service.stampcard.exception;

import com.project.kkookk.domain.stampcard.StampCardStatus;
import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class StampCardStatusInvalidException extends BusinessException {

    public StampCardStatusInvalidException(StampCardStatus from, StampCardStatus to) {
        super(
                ErrorCode.STAMP_CARD_STATUS_INVALID,
                String.format("%s 상태에서 %s 상태로 변경할 수 없습니다.", from, to));
    }
}
