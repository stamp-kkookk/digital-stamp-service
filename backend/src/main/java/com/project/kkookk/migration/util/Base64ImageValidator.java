package com.project.kkookk.migration.util;

import com.project.kkookk.migration.service.exception.MigrationImageTooLargeException;
import java.util.Base64;

public class Base64ImageValidator {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    private Base64ImageValidator() {
        throw new IllegalStateException("Utility class");
    }

    public static void validate(String base64Data) {
        if (base64Data == null || base64Data.isEmpty()) {
            throw new IllegalArgumentException("Image data is required");
        }

        // Data URL 형식인 경우 prefix 제거 (data:image/jpeg;base64,...)
        String base64String = base64Data;
        if (base64Data.contains(",")) {
            String[] parts = base64Data.split(",");
            if (parts.length > 1) {
                base64String = parts[1];
            }
        }

        try {
            byte[] decodedBytes = Base64.getDecoder().decode(base64String);
            if (decodedBytes.length > MAX_IMAGE_SIZE_BYTES) {
                throw new MigrationImageTooLargeException();
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Base64 image data", e);
        }
    }
}
