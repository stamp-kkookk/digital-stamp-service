package com.project.kkookk.domain.terminal.exception;

import com.project.kkookk.common.exception.BusinessException;
import com.project.kkookk.common.exception.ErrorCode;

public class TerminalAccessDeniedException extends BusinessException {
    public TerminalAccessDeniedException() {
        super(ErrorCode.TERMINAL_ACCESS_DENIED);
    }
}
