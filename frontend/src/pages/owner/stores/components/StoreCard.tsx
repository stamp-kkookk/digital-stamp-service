import type { Store, ViewMode } from '../../../../types/store'
import { MapPin, Phone, Users, Ticket, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StoreCardProps {
    store: Store
    viewMode: ViewMode
    onClick: (storeId: number) => void
}

export default function StoreCard({ store, viewMode, onClick }: StoreCardProps) {
    const isActive = store.status === 'ACTIVE'
    const statusLabel = isActive ? '영업중' : '준비중'
    const statusVariant = isActive ? 'success' : 'warning'

    const weeklyChange = store.weeklyChange ?? 0
    const isPositiveChange = weeklyChange >= 0

    // Check if store is newly created (< 24 hours ago)
    const isNew = new Date().getTime() - new Date(store.createdAt).getTime() < 24 * 60 * 60 * 1000

    const handleClick = () => {
        onClick(store.id)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick(store.id)
        }
    }

    if (viewMode === 'list') {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={`flex items-center gap-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-kkookk-indigo/30 hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 ${
                    isNew ? 'animate-pulse-slow' : ''
                }`}
            >
                {/* Status Badge */}
                <div className="flex-shrink-0">
                    <Badge variant={statusVariant} size="sm">
                        {statusLabel}
                    </Badge>
                </div>

                {/* Store Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-kkookk-navy mb-1 truncate">{store.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-kkookk-steel">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{store.address}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Phone className="w-4 h-4" aria-hidden="true" />
                            <span>{store.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="w-5 h-5 text-kkookk-steel" aria-hidden="true" />
                        <div>
                            <span className="font-semibold text-kkookk-navy">{store.customerCount ?? 0}</span>
                            <span className="text-kkookk-steel ml-1">고객</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Ticket className="w-5 h-5 text-kkookk-steel" aria-hidden="true" />
                        <div>
                            <span className="font-semibold text-kkookk-navy">{store.todayStamps ?? 0}</span>
                            <span className="text-kkookk-steel ml-1">오늘 적립</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        {isPositiveChange ? (
                            <TrendingUp className="w-4 h-4 text-green-600" aria-hidden="true" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" aria-hidden="true" />
                        )}
                        <span className={isPositiveChange ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {isPositiveChange ? '+' : ''}
                            {weeklyChange.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    // Grid view
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`flex flex-col p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-kkookk-indigo/30 hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-kkookk-indigo/50 ${
                isNew ? 'animate-pulse-slow' : ''
            }`}
        >
            {/* Status Badge */}
            <div className="mb-4">
                <Badge variant={statusVariant} size="sm">
                    {statusLabel}
                </Badge>
            </div>

            {/* Store Info */}
            <div className="mb-4 flex-1">
                <h3 className="text-lg font-semibold text-kkookk-navy mb-2">{store.name}</h3>
                <div className="flex flex-col gap-1.5 text-sm text-kkookk-steel">
                    <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="break-words">{store.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>{store.phone}</span>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-kkookk-steel" aria-hidden="true" />
                    <span className="font-semibold text-kkookk-navy">{store.customerCount ?? 0}</span>
                    <span className="text-kkookk-steel">고객</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                    <Ticket className="w-4 h-4 text-kkookk-steel" aria-hidden="true" />
                    <span className="font-semibold text-kkookk-navy">{store.todayStamps ?? 0}</span>
                    <span className="text-kkookk-steel">오늘</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                    {isPositiveChange ? (
                        <TrendingUp className="w-4 h-4 text-green-600" aria-hidden="true" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" aria-hidden="true" />
                    )}
                    <span className={isPositiveChange ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {isPositiveChange ? '+' : ''}
                        {weeklyChange.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    )
}
