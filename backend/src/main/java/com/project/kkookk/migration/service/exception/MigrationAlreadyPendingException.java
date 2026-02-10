package com.project.kkookk.migration.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class MigrationAlreadyPendingException extends BusinessException {

    public MigrationAlreadyPendingException() {
        super(ErrorCode.MIGRATION_ALREADY_PENDING);
    }
}
