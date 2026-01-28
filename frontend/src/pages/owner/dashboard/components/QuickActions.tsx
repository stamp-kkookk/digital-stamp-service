import { Plus, Sparkles, Download, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
    onNewStore: () => void
    onCreateStampCard: () => void
    onDownloadQR: () => void
    onViewStats: () => void
}

export default function QuickActions({
    onNewStore,
    onCreateStampCard,
    onDownloadQR,
    onViewStats,
}: QuickActionsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* New Store */}
            <Button
                variant="outline"
                size="lg"
                onClick={onNewStore}
                className="flex-col h-auto py-6 gap-2 group"
                leftIcon={<Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />}
            >
                <span className="text-sm font-semibold">새 매장 등록</span>
            </Button>

            {/* Create StampCard */}
            <Button
                variant="outline"
                size="lg"
                onClick={onCreateStampCard}
                className="flex-col h-auto py-6 gap-2 group"
                leftIcon={<Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />}
            >
                <span className="text-sm font-semibold">스탬프 카드 생성</span>
            </Button>

            {/* Download QR */}
            <Button
                variant="outline"
                size="lg"
                onClick={onDownloadQR}
                className="flex-col h-auto py-6 gap-2 group"
                leftIcon={<Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />}
            >
                <span className="text-sm font-semibold">QR 포스터 다운로드</span>
            </Button>

            {/* View Stats */}
            <Button
                variant="outline"
                size="lg"
                onClick={onViewStats}
                className="flex-col h-auto py-6 gap-2 group"
                leftIcon={<BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />}
            >
                <span className="text-sm font-semibold">통계 리포트 보기</span>
            </Button>
        </div>
    )
}
