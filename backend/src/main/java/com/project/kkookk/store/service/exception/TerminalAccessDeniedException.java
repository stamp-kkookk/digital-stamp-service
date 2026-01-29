package com.project.kkookk.store.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class TerminalAccessDeniedException extends BusinessException {

    public TerminalAccessDeniedException() {
        super(ErrorCode.TERMINAL_ACCESS_DENIED);
    }
}
