package com.project.kkookk.migration.service.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class MigrationImageTooLargeException extends BusinessException {

    public MigrationImageTooLargeException() {
        super(ErrorCode.MIGRATION_IMAGE_TOO_LARGE);
    }
}
