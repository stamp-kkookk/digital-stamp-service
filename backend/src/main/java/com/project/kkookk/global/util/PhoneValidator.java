package com.project.kkookk.global.util;

import java.util.regex.Pattern;

public final class PhoneValidator {

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^(02-\\d{3,4}-\\d{4}|0\\d{2}-\\d{3,4}-\\d{4})$");

    private PhoneValidator() {}

    public static boolean isValid(String phone) {
        if (phone == null || phone.isBlank()) {
            return true;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }
}
