package com.project.kkookk.migration.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class MigrationAccessDeniedException extends BusinessException {

    public MigrationAccessDeniedException() {
        super(ErrorCode.MIGRATION_ACCESS_DENIED);
    }
}
