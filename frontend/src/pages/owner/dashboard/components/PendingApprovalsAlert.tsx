import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { PendingApprovals } from '@/types/dashboard'

interface PendingApprovalsAlertProps {
    data: PendingApprovals
    onNavigateToApproval: () => void
}

export default function PendingApprovalsAlert({ data, onNavigateToApproval }: PendingApprovalsAlertProps) {
    if (data.count === 0) return null

    return (
        <div className="bg-gradient-to-r from-kkookk-indigo/10 to-kkookk-indigo/5 rounded-2xl p-6 border-l-4 border-kkookk-indigo animate-fadeInUp">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Left: Alert Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-kkookk-indigo rounded-full p-2 flex-shrink-0 animate-pulse-badge">
                        <Bell className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-kkookk-navy mb-1">
                            승인 대기 중인 적립 요청 {data.count}건
                        </h3>
                        <p className="text-sm text-kkookk-steel">
                            최근 1시간: <span className="font-medium text-kkookk-navy">{data.recentProcessed}건 처리</span>
                        </p>
                    </div>
                </div>

                {/* Right: CTA */}
                <Button
                    variant="secondary"
                    size="md"
                    onClick={onNavigateToApproval}
                    className="flex-shrink-0"
                >
                    승인 화면으로 이동
                </Button>
            </div>
        </div>
    )
}
