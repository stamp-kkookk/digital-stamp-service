/**
 * Validation utilities and schemas
 *
 * This module provides:
 * - Validation functions (return error message or null)
 * - Formatting functions
 * - Reusable Zod schemas
 */

// Phone validation
export { validatePhone, isValidPhone, formatPhoneNumber, phoneRegex } from './phone'

// Auth validation
export { validateOtp, validateName, validateNickname } from './auth'

// Zod schemas
export {
    phoneSchema,
    requiredPhoneSchema,
    storeNameSchema,
    addressSchema,
    otpSchema,
    nameSchema,
    nicknameSchema,
} from './schemas'
