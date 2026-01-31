/**
 * Reusable Zod schemas for form validation
 *
 * These schemas can be composed into larger form schemas.
 */

import { z } from 'zod'
import { isValidPhone } from './phone'

// ============================================================================
// Phone
// ============================================================================

export const phoneSchema = z
    .string()
    .refine(
        (val) => !val || isValidPhone(val),
        '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)'
    )
    .optional()

export const requiredPhoneSchema = z.string().refine(isValidPhone, '올바른 전화번호 형식이 아닙니다 (010-XXXX-XXXX)')

// ============================================================================
// Store
// ============================================================================

export const storeNameSchema = z.string().min(1, '매장명을 입력해주세요').max(100, '매장명은 100자 이하로 입력해주세요')

export const addressSchema = z.string().max(255, '주소는 255자를 초과할 수 없습니다').optional().or(z.literal(''))

// ============================================================================
// Auth
// ============================================================================

export const otpSchema = z
    .string()
    .length(4, '인증번호 4자리를 입력해주세요')
    .regex(/^\d{4}$/, '숫자만 입력 가능합니다')

export const nameSchema = z.string().min(2, '이름은 2글자 이상이어야 합니다').max(50, '이름은 50자 이하여야 합니다')

export const nicknameSchema = z.string().min(1, '닉네임을 입력해주세요').max(10, '닉네임은 10글자 이하여야 합니다')
