package com.project.kkookk.common.exception;

import com.project.kkookk.global.exception.BusinessException;
import com.project.kkookk.global.exception.ErrorCode;

public class FileStorageException extends BusinessException {
    public FileStorageException() {
        super(ErrorCode.FILE_STORAGE_ERROR);
    }
}
