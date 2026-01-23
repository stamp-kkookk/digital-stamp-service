/**
 * Store Registration Wizard Types
 *
 * Local types for the 3-step store registration wizard.
 * Some fields (category, logo) are frontend-only until backend support is added.
 */

export type StoreCategory =
    | '카페'
    | '음식점'
    | '베이커리'
    | '뷰티/미용'
    | '리테일'
    | '기타'

export interface StoreRegistrationFormData {
    // Step 1: Basic Info
    name: string
    category: StoreCategory
    logoFile?: File

    // Step 2: Location & Contact
    address?: string
    phone?: string

    // Step 3: Stamp & Reward Setup
    stampCardName: string
    maxStamps: number
    rewardDescription: string
    termsAgreed: boolean
}

export interface CreateStoreRequest {
    name: string
    address?: string
    phone?: string
    status: 'ACTIVE' | 'INACTIVE'
}

export interface CreateStoreResponse {
    id: number
    name: string
    address?: string
    phone?: string
    status: 'ACTIVE' | 'INACTIVE'
    ownerAccountId: number
    createdAt: string
    updatedAt: string
}

export type WizardStep = 1 | 2 | 3
