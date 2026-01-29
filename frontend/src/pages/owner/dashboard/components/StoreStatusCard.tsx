import { Store, CreditCard, Users, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { StoreStatus } from '@/types/dashboard'

interface StoreStatusCardProps {
    store: StoreStatus
    onViewDetails: (storeId: number) => void
}

export default function StoreStatusCard({ store, onViewDetails }: StoreStatusCardProps) {
    return (
        <Card variant="elevated" padding="md" className="group hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-kkookk-indigo/10 rounded-full p-2">
                        <Store className="w-5 h-5 text-kkookk-indigo" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-kkookk-navy">{store.name}</h3>
                </div>
                <Badge variant="info" size="sm">
                    {store.activeStampCards}개 카드
                </Badge>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Today Issuance */}
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" aria-hidden="true" />
                    <div>
                        <p className="text-xs text-kkookk-steel">오늘 적립</p>
                        <p className="text-base font-semibold text-kkookk-navy">{store.todayIssuance}건</p>
                    </div>
                </div>

                {/* Today Redemption */}
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-kkookk-orange-500" aria-hidden="true" />
                    <div>
                        <p className="text-xs text-kkookk-steel">오늘 리딤</p>
                        <p className="text-base font-semibold text-kkookk-navy">{store.todayRedemption}건</p>
                    </div>
                </div>
            </div>

            {/* Active Customers */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-kkookk-sand rounded-xl">
                <Users className="w-4 h-4 text-kkookk-steel" aria-hidden="true" />
                <p className="text-sm text-kkookk-steel">
                    활성 고객 <span className="font-semibold text-kkookk-navy">{store.activeCustomers}명</span>
                </p>
            </div>

            {/* CTA */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(store.id)}
                className="w-full"
            >
                상세 보기
            </Button>
        </Card>
    )
}
