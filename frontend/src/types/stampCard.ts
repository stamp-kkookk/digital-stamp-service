/**
 * Stamp Card Types
 * Based on backend DTOs
 */

export const STAMP_CARD_STATUS = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    ARCHIVED: 'ARCHIVED',
} as const

export type StampCardStatus = (typeof STAMP_CARD_STATUS)[keyof typeof STAMP_CARD_STATUS]

export interface StampCardDesign {
    mode: 'custom' | 'puzzle'
    // Custom mode
    backgroundImage?: string
    emptyIcon?: string
    stampIcon?: string
    // Puzzle mode
    puzzleGrid?: '2x2' | '3x3' | '4x4' | '5x4'
    puzzleImage?: string
    // Common
    backgroundColor?: string
    primaryColor?: string
}

export interface CreateStampCardRequest {
    title: string
    goalStampCount: number
    requiredStamps?: number
    rewardName?: string
    rewardQuantity?: number
    expireDays?: number
    designJson?: string
}

export interface UpdateStampCardRequest {
    title: string
    goalStampCount: number
    requiredStamps?: number
    rewardName?: string
    rewardQuantity?: number
    expireDays?: number
    designJson?: string
}

export interface UpdateStampCardStatusRequest {
    status: StampCardStatus
}

export interface StampCardResponse {
    id: number
    title: string
    status: StampCardStatus
    goalStampCount: number
    requiredStamps: number | null
    rewardName: string | null
    rewardQuantity: number | null
    expireDays: number | null
    designJson: string | null
    storeId: number
    createdAt: string
    updatedAt: string
}

export interface StampCardSummary {
    id: number
    title: string
    status: StampCardStatus
    goalStampCount: number
    rewardName: string | null
    createdAt: string
}

export interface PageInfo {
    number: number
    size: number
    totalElements: number
    totalPages: number
}

export interface StampCardListResponse {
    content: StampCardSummary[]
    page: PageInfo
}
