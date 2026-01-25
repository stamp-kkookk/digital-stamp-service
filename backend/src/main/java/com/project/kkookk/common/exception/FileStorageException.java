package com.project.kkookk.common.exception;

public class FileStorageException extends BusinessException {
    public FileStorageException() {
        super(ErrorCode.FILE_STORAGE_ERROR);
    }
}
