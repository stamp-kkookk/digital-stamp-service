/**
 * Authentication-related validation utilities
 */

/**
 * Validate OTP code (exactly 4 digits)
 * @returns Error message if invalid, null if valid
 */
export const validateOtp = (otp: string): string | null => {
    if (otp.length !== 4) {
        return '인증번호 4자리를 입력해주세요'
    }

    if (!/^\d{4}$/.test(otp)) {
        return '숫자만 입력 가능합니다'
    }

    return null
}

/**
 * Validate name (2+ characters)
 * @returns Error message if invalid, null if valid
 */
export const validateName = (name: string): string | null => {
    if (!name.trim()) {
        return '이름을 입력해주세요'
    }

    if (name.length < 2) {
        return '이름은 2글자 이상이어야 합니다'
    }

    return null
}

/**
 * Validate nickname (1-10 characters)
 * @returns Error message if invalid, null if valid
 */
export const validateNickname = (nickname: string): string | null => {
    if (!nickname.trim()) {
        return '닉네임을 입력해주세요'
    }

    if (nickname.length > 10) {
        return '닉네임은 10글자 이하여야 합니다'
    }

    return null
}
