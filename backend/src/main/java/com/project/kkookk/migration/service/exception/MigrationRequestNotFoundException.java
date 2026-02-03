package com.project.kkookk.migration.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class MigrationRequestNotFoundException extends BusinessException {

    public MigrationRequestNotFoundException() {
        super(ErrorCode.MIGRATION_REQUEST_NOT_FOUND);
    }
}
