import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { DashboardKPI } from '@/types/dashboard'

interface KpiCardProps {
    title: string
    kpi: DashboardKPI
    unit?: string
    subtitle?: string
}

export default function KpiCard({ title, kpi, unit = '%', subtitle }: KpiCardProps) {
    const isPositive = kpi.change > 0
    const isNeutral = kpi.change === 0
    const changeColor = isNeutral ? 'text-kkookk-steel' : isPositive ? 'text-green-600' : 'text-red-600'

    return (
        <Card variant="elevated" padding="md" className="group">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-kkookk-steel mb-2">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-kkookk-navy">
                        {kpi.value.toLocaleString()}
                    </span>
                    <span className="text-base font-medium text-kkookk-steel">{unit}</span>
                </div>
            </div>

            {/* Subtitle (optional) */}
            {subtitle && (
                <p className="text-xs text-kkookk-steel mb-3">{subtitle}</p>
            )}

            {/* Additional info (completion rate) */}
            {kpi.total !== undefined && kpi.completed !== undefined && (
                <p className="text-xs text-kkookk-steel mb-3">
                    {kpi.completed}/{kpi.total} 건 {kpi.period ? `(${kpi.period})` : ''}
                </p>
            )}

            {/* Change Indicator */}
            <div className="flex items-center gap-1.5">
                {isNeutral ? (
                    <Minus className="w-4 h-4 text-kkookk-steel" aria-hidden="true" />
                ) : isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600" aria-hidden="true" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" aria-hidden="true" />
                )}
                <span
                    className={`text-sm font-semibold ${changeColor}`}
                    aria-label={`${isPositive ? 'Increased' : isNeutral ? 'No change' : 'Decreased'} by ${Math.abs(kpi.change)} percent`}
                >
                    {isPositive ? '+' : ''}
                    {kpi.change.toFixed(1)}%
                </span>
                <span className="text-xs text-kkookk-steel ml-1">전주 대비</span>
            </div>
        </Card>
    )
}
