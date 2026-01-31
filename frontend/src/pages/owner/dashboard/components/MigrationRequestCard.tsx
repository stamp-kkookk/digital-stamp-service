import { Image, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MigrationRequests } from '@/types/dashboard'

interface MigrationRequestCardProps {
    data: MigrationRequests
    onNavigateToMigration: () => void
}

export default function MigrationRequestCard({ data, onNavigateToMigration }: MigrationRequestCardProps) {
    if (data.pending === 0) {
        return (
            <Card variant="bordered" padding="md" className="bg-kkookk-sand/30">
                <div className="flex items-center gap-3">
                    <div className="bg-kkookk-steel/10 rounded-full p-3">
                        <Image className="w-5 h-5 text-kkookk-steel" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-kkookk-navy mb-1">
                            종이 스탬프 이전 요청
                        </h3>
                        <p className="text-xs text-kkookk-steel">
                            처리 대기 중인 요청이 없습니다
                        </p>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card variant="bordered" padding="md" className="border-kkookk-indigo/30 bg-kkookk-indigo/5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                {/* Left: Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="bg-kkookk-indigo rounded-full p-3 flex-shrink-0">
                        <Image className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-kkookk-navy mb-2">
                            처리 대기 중인 종이 스탬프 이전 요청 {data.pending}건
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-kkookk-steel">
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            <span>평균 처리 시간: {data.avgProcessingTime}</span>
                        </div>
                    </div>
                </div>

                {/* Right: CTA */}
                <Button
                    variant="secondary"
                    size="md"
                    onClick={onNavigateToMigration}
                    className="flex-shrink-0"
                >
                    처리하기
                </Button>
            </div>
        </Card>
    )
}
