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
