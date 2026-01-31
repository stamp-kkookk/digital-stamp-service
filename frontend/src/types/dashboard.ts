// ============================================================================
// Owner Dashboard types
// ============================================================================

export interface DashboardKPI {
    value: number
    change: number // percentage
    total?: number // for completion rates
    completed?: number // for completion rates
    period?: string // e.g., "D7", "이번주"
}

export interface DashboardKPIs {
    issuanceCompletionRate: DashboardKPI
    redeemCompletionRate: DashboardKPI
    returningCustomers: DashboardKPI
    rewardUsageRate: DashboardKPI
    fraudBlockCount: DashboardKPI
}

export interface PendingApprovals {
    count: number
    recentProcessed: number
}

export interface StoreStatus {
    id: number
    name: string
    activeStampCards: number
    todayIssuance: number
    todayRedemption: number
    activeCustomers: number
}

export type ActivityType = 'issuance' | 'redeem' | 'alert' | 'migration'

export interface RecentActivity {
    id: string
    timestamp: string
    type: ActivityType
    store: string
    description: string
}

export interface MigrationRequests {
    pending: number
    avgProcessingTime: string
}

export interface DashboardData {
    kpis: DashboardKPIs
    pendingApprovals: PendingApprovals
    stores: StoreStatus[]
    recentActivities: RecentActivity[]
    migrationRequests: MigrationRequests
}
