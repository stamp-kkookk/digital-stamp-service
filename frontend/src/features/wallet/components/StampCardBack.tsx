/**
 * StampCardBack 컴포넌트
 * 카드 뒷면 - 스탬프 진행도 + 보상 정보 + 도장 그리드
 * 가로형 (1.58:1), backfaceVisibility/rotateY는 부모에서 처리
 */

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StampCard } from '@/types/domain'

interface StampCardBackProps {
    card: StampCard
    className?: string
}

function getGridCols(max: number): string {
    if (max <= 5) return 'grid-cols-5'
    if (max <= 10) return 'grid-cols-5'
    if (max <= 15) return 'grid-cols-5'
    return 'grid-cols-5'
}

export function StampCardBack({ card, className }: StampCardBackProps) {
    const stampColor = card.stampColor || 'bg-kkookk-orange-500'
    const gridCols = getGridCols(card.max)
    const isComplete = card.current >= card.max

    return (
        <div
            className={cn(
                'w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative',
                'bg-white select-none flex flex-col',
                className,
            )}
        >
            {/* 보더 */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-200/80 pointer-events-none" />

            {/* 상단: 진행률 + 보상 */}
            <div className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-kkookk-navy tabular-nums">
                        {card.current}/{card.max}
                    </span>
                    <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className={cn('h-full rounded-full', stampColor)}
                            style={{ width: `${Math.min((card.current / card.max) * 100, 100)}%` }}
                        />
                    </div>
                </div>
                {card.reward && (
                    <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                        isComplete
                            ? 'bg-kkookk-orange-500 text-white'
                            : 'bg-slate-100 text-slate-500',
                    )}>
                        {card.reward}
                    </span>
                )}
            </div>

            {/* 스탬프 그리드 */}
            <div className={cn(
                'grid gap-1.5 px-3 pb-3 flex-1 content-center',
                gridCols,
                'place-items-center',
            )}>
                {Array.from({ length: card.max }).map((_, i) => {
                    const isActive = i < card.current
                    return (
                        <div
                            key={i}
                            className={cn(
                                'aspect-square w-full rounded-full flex items-center justify-center',
                                'transition-all duration-500',
                                isActive
                                    ? cn(stampColor, 'text-white')
                                    : 'bg-slate-50 text-slate-300 ring-1 ring-inset ring-slate-100',
                            )}
                            style={{
                                boxShadow: isActive
                                    ? '0 2px 8px -2px rgba(0,0,0,0.15), 0 1px 3px -1px rgba(0,0,0,0.1)'
                                    : 'none',
                            }}
                        >
                            {isActive ? (
                                card.stampImage ? (
                                    <img
                                        src={card.stampImage}
                                        alt="stamp"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <Check size={14} strokeWidth={3} />
                                )
                            ) : (
                                <span className="text-[9px] font-medium">{i + 1}</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default StampCardBack
