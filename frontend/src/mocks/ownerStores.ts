import type { Store, DashboardMetrics } from '../types/store'

export const mockDashboardMetrics: DashboardMetrics = {
    activeCustomers: {
        count: 301,
        change: 12.5,
        trend: [280, 285, 290, 295, 298, 301],
    },
    todayStamps: {
        count: 38,
        change: 3.2,
        trend: [30, 32, 35, 36, 37, 38],
    },
    unusedCoupons: {
        count: 47,
        change: -5.1,
        trend: [52, 51, 50, 49, 48, 47],
    },
}

export const mockStores: Store[] = [
    {
        id: 1,
        name: '카페 본점',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        status: 'ACTIVE',
        createdAt: '2025-01-10T10:00:00',
        updatedAt: '2025-01-23T10:00:00',
        ownerAccountId: 1,
        customerCount: 156,
        todayStamps: 23,
        weeklyChange: 8.5,
    },
    {
        id: 2,
        name: '카페 2호점',
        address: '서울시 서초구 서초대로 456',
        phone: '02-2345-6789',
        status: 'INACTIVE',
        createdAt: '2025-01-20T10:00:00',
        updatedAt: '2025-01-23T10:00:00',
        ownerAccountId: 1,
        customerCount: 0,
        todayStamps: 0,
        weeklyChange: 0,
    },
]
