import type { DashboardData } from '../types/dashboard'

export const mockDashboardData: DashboardData = {
    kpis: {
        issuanceCompletionRate: {
            value: 80,
            change: 12.3,
            total: 30,
            completed: 24,
        },
        redeemCompletionRate: {
            value: 95,
            change: -3.2,
            total: 20,
            completed: 19,
            period: '이번주',
        },
        returningCustomers: {
            value: 67,
            change: 8.5,
            period: 'D7',
        },
        rewardUsageRate: {
            value: 72,
            change: 5.1,
        },
        fraudBlockCount: {
            value: 3,
            change: 0,
        },
    },
    pendingApprovals: {
        count: 3,
        recentProcessed: 12,
    },
    stores: [
        {
            id: 1,
            name: '강남점',
            activeStampCards: 2,
            todayIssuance: 15,
            todayRedemption: 3,
            activeCustomers: 87,
        },
        {
            id: 2,
            name: '홍대점',
            activeStampCards: 1,
            todayIssuance: 8,
            todayRedemption: 1,
            activeCustomers: 42,
        },
        {
            id: 3,
            name: '신촌점',
            activeStampCards: 2,
            todayIssuance: 12,
            todayRedemption: 2,
            activeCustomers: 53,
        },
    ],
    recentActivities: [
        {
            id: '1',
            timestamp: '5분 전',
            type: 'issuance',
            store: '강남점',
            description: '김철수님 적립 승인 완료',
        },
        {
            id: '2',
            timestamp: '12분 전',
            type: 'redeem',
            store: '홍대점',
            description: '이영희님 리워드 사용 완료',
        },
        {
            id: '3',
            timestamp: '18분 전',
            type: 'alert',
            store: '강남점',
            description: '10분간 적립 요청 급증 (20건)',
        },
        {
            id: '4',
            timestamp: '23분 전',
            type: 'issuance',
            store: '신촌점',
            description: '박민수님 적립 승인 완료',
        },
        {
            id: '5',
            timestamp: '35분 전',
            type: 'migration',
            store: '강남점',
            description: '종이 스탬프 이전 요청 승인 완료',
        },
        {
            id: '6',
            timestamp: '42분 전',
            type: 'redeem',
            store: '신촌점',
            description: '최지은님 리워드 사용 완료',
        },
        {
            id: '7',
            timestamp: '1시간 전',
            type: 'alert',
            store: '홍대점',
            description: '리딤 TTL 만료 3건 발생',
        },
        {
            id: '8',
            timestamp: '1시간 전',
            type: 'issuance',
            store: '홍대점',
            description: '정수연님 적립 승인 완료',
        },
    ],
    migrationRequests: {
        pending: 5,
        avgProcessingTime: '24시간',
    },
}
