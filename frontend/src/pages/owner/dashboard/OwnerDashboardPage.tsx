import { useNavigate } from 'react-router-dom'
import OwnerLayout from '@/components/layout/OwnerLayout'
import KpiCard from './components/KpiCard'
import PendingApprovalsAlert from './components/PendingApprovalsAlert'
import StoreStatusCard from './components/StoreStatusCard'
import ActivityTimeline from './components/ActivityTimeline'
import MigrationRequestCard from './components/MigrationRequestCard'
import { mockDashboardData } from '@/mocks/ownerDashboard'

export default function OwnerDashboardPage() {
    const navigate = useNavigate()

    // Event handlers
    const handleNavigateToApproval = () => {
        console.log('승인 화면으로 이동')
        // navigate('/owner/terminal/approval')
    }

    const handleViewStoreDetails = (storeId: number) => {
        console.log('매장 상세 페이지 이동:', storeId)
        navigate(`/owner/stores/${storeId}/stamp-cards`)
    }

    const handleNavigateToMigration = () => {
        console.log('이전 요청 처리 페이지로 이동')
        // navigate('/owner/migration-requests')
    }

    const { kpis, pendingApprovals, stores, recentActivities, migrationRequests } = mockDashboardData

    return (
        <OwnerLayout>
            <div className="max-w-7xl mx-auto animate-fadeInUp">
                {/* Page Header */}
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold text-kkookk-navy mb-2">대시보드</h1>
                    <p className="text-sm text-kkookk-steel">
                        매장 운영 현황을 한눈에 확인하고 관리하세요
                    </p>
                </header>

                {/* Section 1: KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div
                        className="animate-fadeInUp"
                        style={{ animationDelay: '0ms', animationFillMode: 'both' }}
                    >
                        <KpiCard
                            title="적립 완료율"
                            kpi={kpis.issuanceCompletionRate}
                            subtitle="오늘 기준"
                        />
                    </div>
                    <div
                        className="animate-fadeInUp"
                        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
                    >
                        <KpiCard
                            title="리딤 완료율"
                            kpi={kpis.redeemCompletionRate}
                            subtitle="이번주 기준"
                        />
                    </div>
                    <div
                        className="animate-fadeInUp"
                        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
                    >
                        <KpiCard
                            title="재방문 고객"
                            kpi={kpis.returningCustomers}
                            unit="명"
                            subtitle="최근 7일"
                        />
                    </div>
                    <div
                        className="animate-fadeInUp"
                        style={{ animationDelay: '300ms', animationFillMode: 'both' }}
                    >
                        <KpiCard
                            title="리워드 사용률"
                            kpi={kpis.rewardUsageRate}
                        />
                    </div>
                    <div
                        className="animate-fadeInUp"
                        style={{ animationDelay: '400ms', animationFillMode: 'both' }}
                    >
                        <KpiCard
                            title="부정 차단"
                            kpi={kpis.fraudBlockCount}
                            unit="건"
                            subtitle="오늘"
                        />
                    </div>
                </div>

                {/* Section 2: Pending Approvals Alert */}
                <div className="mb-8">
                    <PendingApprovalsAlert
                        data={pendingApprovals}
                        onNavigateToApproval={handleNavigateToApproval}
                    />
                </div>

                {/* Section 3: Store Status Cards */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-kkookk-navy mb-4">매장별 현황</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map((store, index) => (
                            <div
                                key={store.id}
                                className="animate-fadeInUp"
                                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                            >
                                <StoreStatusCard
                                    store={store}
                                    onViewDetails={handleViewStoreDetails}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 4 & 5: Activity Timeline + Migration Requests (2 columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Timeline (takes 2 columns) */}
                    <div className="lg:col-span-2">
                        <ActivityTimeline activities={recentActivities} />
                    </div>

                    {/* Migration Request Card (takes 1 column) */}
                    <div>
                        <MigrationRequestCard
                            data={migrationRequests}
                            onNavigateToMigration={handleNavigateToMigration}
                        />
                    </div>
                </div>
            </div>
        </OwnerLayout>
    )
}
