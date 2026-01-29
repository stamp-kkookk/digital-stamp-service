import { z } from 'zod'
import { storeNameSchema, addressSchema, phoneSchema } from '@/lib/utils/validation'

/**
 * Store Registration Wizard Validation Schemas
 *
 * Progressive validation for each step of the wizard.
 * Each step has its own schema for granular validation.
 */

// Step 1: Basic Info
export const step1Schema = z.object({
    name: storeNameSchema,
    category: z.enum(['카페', '음식점', '베이커리', '뷰티/미용', '리테일', '기타'], {
        message: '카테고리를 선택해주세요',
    }),
    logoFile: z.instanceof(File).optional(),
})

// Step 2: Location & Contact
export const step2Schema = z.object({
    address: addressSchema,
    phone: phoneSchema,
})

// Step 3: Stamp & Reward Setup
export const step3Schema = z.object({
    stampCardName: z
        .string()
        .min(2, '스탬프 카드 이름은 2자 이상이어야 합니다')
        .max(50, '스탬프 카드 이름은 50자를 초과할 수 없습니다'),
    maxStamps: z
        .number()
        .min(1, '최소 1개 이상이어야 합니다')
        .max(20, '최대 20개까지 설정 가능합니다'),
    rewardDescription: z
        .string()
        .min(1, '리워드 설명을 입력해주세요')
        .max(200, '리워드 설명은 200자를 초과할 수 없습니다'),
    termsAgreed: z.boolean().refine((val) => val === true, {
        message: '약관에 동의해주세요',
    }),
})

// Complete form schema (all steps combined)
// Ensures schema matches the FormData type from @/types/store
export const storeRegistrationSchema = z.object({
    // Step 1
    name: storeNameSchema,
    category: z.enum(['카페', '음식점', '베이커리', '뷰티/미용', '리테일', '기타'], {
        message: '카테고리를 선택해주세요',
    }),
    logoFile: z.instanceof(File).optional(),

    // Step 2
    address: addressSchema,
    phone: phoneSchema,

    // Step 3
    stampCardName: z
        .string()
        .min(2, '스탬프 카드 이름은 2자 이상이어야 합니다')
        .max(50, '스탬프 카드 이름은 50자를 초과할 수 없습니다'),
    maxStamps: z
        .number()
        .min(1, '최소 1개 이상이어야 합니다')
        .max(20, '최대 20개까지 설정 가능합니다'),
    rewardDescription: z
        .string()
        .min(1, '리워드 설명을 입력해주세요')
        .max(200, '리워드 설명은 200자를 초과할 수 없습니다'),
    termsAgreed: z.boolean().refine((val) => val === true, {
        message: '약관에 동의해주세요',
    }),
})

// Re-export the type from central location for convenience
export type { StoreRegistrationFormData } from '@/types/store'
