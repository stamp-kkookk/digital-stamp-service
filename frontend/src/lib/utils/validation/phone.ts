/**
 * Phone number validation and formatting utilities
 */

/**
 * Validate phone number (11 digits, starts with 010)
 * @returns Error message if invalid, null if valid
 */
export const validatePhone = (phone: string): string | null => {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length !== 11) {
        return '전화번호는 11자리여야 합니다'
    }

    if (!cleaned.startsWith('010')) {
        return '올바른 휴대폰 번호를 입력해주세요'
    }

    return null
}

/**
 * Check if phone number is valid (boolean version)
 */
export const isValidPhone = (phone: string): boolean => {
    return validatePhone(phone) === null
}

/**
 * Format phone number with dashes (010-0000-0000)
 */
export const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length <= 3) {
        return cleaned
    }

    if (cleaned.length <= 7) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    }

    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`
}

/**
 * Phone number regex pattern
 */
export const phoneRegex = /^010-?[0-9]{3,4}-?[0-9]{4}$/
