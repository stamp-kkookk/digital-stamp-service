import type { DashboardMetrics } from '../../../../types/store'
import MetricCard from './MetricCard'

interface DashboardCardsProps {
    metrics: DashboardMetrics
}

export default function DashboardCards({ metrics }: DashboardCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
                className="animate-fadeInUp"
                style={{ animationDelay: '0ms', animationFillMode: 'both' }}
            >
                <MetricCard
                    title="활성 고객 수"
                    value={metrics.activeCustomers.count}
                    unit="명"
                    change={metrics.activeCustomers.change}
                    trend={metrics.activeCustomers.trend}
                />
            </div>
            <div
                className="animate-fadeInUp"
                style={{ animationDelay: '100ms', animationFillMode: 'both' }}
            >
                <MetricCard
                    title="오늘 발급 스탬프"
                    value={metrics.todayStamps.count}
                    unit="개"
                    change={metrics.todayStamps.change}
                    trend={metrics.todayStamps.trend}
                />
            </div>
            <div
                className="animate-fadeInUp"
                style={{ animationDelay: '200ms', animationFillMode: 'both' }}
            >
                <MetricCard
                    title="미사용 쿠폰"
                    value={metrics.unusedCoupons.count}
                    unit="개"
                    change={metrics.unusedCoupons.change}
                    trend={metrics.unusedCoupons.trend}
                />
            </div>
        </div>
    )
}
