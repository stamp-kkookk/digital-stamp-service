export type StoreStatus = 'ACTIVE' | 'INACTIVE'

export interface Store {
    id: number
    name: string
    address: string
    phone: string
    status: StoreStatus
    createdAt: string
    updatedAt: string
    ownerAccountId: number

    // Frontend-only metrics
    customerCount?: number
    todayStamps?: number
    weeklyChange?: number // percentage
}

export interface DashboardMetrics {
    activeCustomers: { count: number; change: number; trend: number[] }
    todayStamps: { count: number; change: number; trend: number[] }
    unusedCoupons: { count: number; change: number; trend: number[] }
}

export type ViewMode = 'grid' | 'list'
export type SortOption = 'latest' | 'name' | 'customers'

// ============================================================================
// Terminal-specific types
// ============================================================================

/**
 * Simplified store representation used in terminal flows
 */
export interface OwnerStore {
    storeId: string
    storeName: string
}

// ============================================================================
// Store Registration types
// ============================================================================

export type StoreCategory =
    | '카페'
    | '음식점'
    | '베이커리'
    | '뷰티/미용'
    | '리테일'
    | '기타'

/**
 * Form data for the 3-step store registration wizard
 * Some fields (category, logo) are frontend-only until backend support is added.
 */
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

// ============================================================================
// Customer Store Summary types
// ============================================================================

export interface StampCardInfo {
    stampCardId: number;
    name: string;
    reward: string;
    stampBenefit: string;
    imageUrl: string | null;
}

export interface StoreStampCardSummaryResponse {
    storeName: string;
    stampCard: StampCardInfo | null;
}
