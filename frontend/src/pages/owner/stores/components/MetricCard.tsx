import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface MetricCardProps {
    title: string
    value: number
    unit: string
    change: number
    trend: number[]
}

export default function MetricCard({ title, value, unit, change, trend }: MetricCardProps) {
    const isPositive = change >= 0
    const chartData = trend.map((value, index) => ({ index, value }))

    return (
        <Card variant="elevated" padding="md" className="group flex flex-col">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-sm font-medium text-kkookk-steel mb-2">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-kkookk-navy">{value.toLocaleString()}</span>
                    <span className="text-sm font-medium text-kkookk-steel">{unit}</span>
                </div>
            </div>

            {/* Sparkline */}
            <div className="mb-3 -mx-2">
                <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={chartData}>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2e58ff"
                            strokeWidth={2}
                            dot={false}
                            animationDuration={1200}
                            animationEasing="ease-out"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Change Indicator */}
            <div className="flex items-center gap-1.5">
                {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600" aria-hidden="true" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" aria-hidden="true" />
                )}
                <span
                    className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    aria-label={`${isPositive ? 'Increased' : 'Decreased'} by ${Math.abs(change)} percent`}
                >
                    {isPositive ? '+' : ''}
                    {change.toFixed(1)}%
                </span>
                <span className="text-xs text-kkookk-steel ml-1">전주 대비</span>
            </div>
        </Card>
    )
}
