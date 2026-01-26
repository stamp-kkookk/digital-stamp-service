package com.project.kkookk.service.stampcard.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class StampCardAlreadyActiveException extends BusinessException {

    public StampCardAlreadyActiveException() {
        super(
                ErrorCode.STAMP_CARD_ALREADY_ACTIVE,
                "이미 활성화된 스탬프 카드가 존재합니다. 기존 카드를 비활성화한 후 다시 시도해주세요.");
    }
}
