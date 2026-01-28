import { CheckCircle2, Gift, AlertTriangle, Image } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { RecentActivity, ActivityType } from '@/types/dashboard'

interface ActivityTimelineProps {
    activities: RecentActivity[]
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
    issuance: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
    redeem: <Gift className="w-4 h-4" aria-hidden="true" />,
    alert: <AlertTriangle className="w-4 h-4" aria-hidden="true" />,
    migration: <Image className="w-4 h-4" aria-hidden="true" />,
}

const activityBadgeVariants: Record<ActivityType, 'success' | 'warning' | 'danger' | 'info'> = {
    issuance: 'success',
    redeem: 'info',
    alert: 'warning',
    migration: 'info',
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
    return (
        <Card variant="default" padding="md">
            <h2 className="text-lg font-semibold text-kkookk-navy mb-4">최근 활동</h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-3 border-b border-kkookk-steel/10 last:border-0 animate-fadeInUp"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                    >
                        {/* Icon */}
                        <div
                            className={`p-2 rounded-lg flex-shrink-0 ${
                                activity.type === 'issuance'
                                    ? 'bg-green-50 text-green-600'
                                    : activity.type === 'redeem'
                                      ? 'bg-blue-50 text-kkookk-indigo'
                                      : activity.type === 'alert'
                                        ? 'bg-yellow-50 text-kkookk-amber'
                                        : 'bg-purple-50 text-purple-600'
                            }`}
                        >
                            {activityIcons[activity.type]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="text-sm font-medium text-kkookk-navy break-words">
                                    {activity.description}
                                </p>
                                <span className="text-xs text-kkookk-steel flex-shrink-0">
                                    {activity.timestamp}
                                </span>
                            </div>
                            <Badge variant={activityBadgeVariants[activity.type]} size="sm">
                                {activity.store}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}
