import { z } from 'zod'
export const stampCardFormSchema = z.object({
    // Card Title    
    title: z
        .string()
        .min(1, '카드 제목을 입력해주세요')
        .max(100, '카드 제목은 100자 이하여야 합니다')
        .refine((val) => val.trim().length > 0, { message: '카드 제목을 입력해주세요', }),

    // Goal Stamp Count    
    goalStampCount: z
        .number()
        .min(4, '스탬프 개수는 4~20개 사이여야 합니다')
        .max(20, '스탬프 개수는 4~20개 사이여야 합니다'),
    // Reward Name (optional)    
    rewardName: z
        .string()
        .max(255, '리워드 명은 255자 이하여야 합니다')
        .optional()
        .or(z.literal('')),

    // Reward Quantity    
    rewardQuantity: z.number().min(1, '리워드 수량은 1 이상이어야 합니다'),

    // Expire Days    
    expireDays: z.number().min(1, '리워드 유효기간은 1일 이상이어야 합니다'),
})

export type StampCardFormData = z.infer<typeof stampCardFormSchema>