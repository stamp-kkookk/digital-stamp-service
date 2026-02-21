/**
 * StampCardBack 컴포넌트
 * 카드 뒷면 - 스탬프 진행도 + 보상 정보 + 도장 그리드
 * 가로형 (1.58:1), backfaceVisibility/rotateY는 부모에서 처리
 *
 * 그리드 슬롯 유형:
 * - 채워진 스탬프: 체크 또는 stampImage
 * - 적립 버튼: 다음 빈 슬롯에 Plus 아이콘 (펄스 애니메이션)
 * - 애니메이션 스탬프: 실물 도장 내려찍기 (위→아래 + 충격 파동)
 * - 빈 슬롯: 슬롯 번호
 */

import { Check, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { StampCard } from '@/types/domain'

interface StampCardBackProps {
    card: StampCard
    className?: string
    onStampRequest?: () => void
    animatingStampIndex?: number
    onAnimationComplete?: () => void
}

function getGridCols(max: number): string {
    if (max <= 5) return 'grid-cols-5'
    if (max <= 10) return 'grid-cols-5'
    if (max <= 15) return 'grid-cols-5'
    return 'grid-cols-5'
}

export function StampCardBack({ card, className, onStampRequest, animatingStampIndex, onAnimationComplete }: StampCardBackProps) {
    const stampColor = card.stampColor || 'bg-kkookk-orange-500'
    const gridCols = getGridCols(card.max)
    const isComplete = card.current >= card.max

    return (
        <div
            className={cn(
                'w-full aspect-[1.58/1] rounded-2xl overflow-hidden relative',
                'bg-white select-none flex flex-col texture-cardstock-white shadow-cardstock',
                className,
            )}
        >
            {/* 보더 + 엣지 두께감 */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-200/80 pointer-events-none" />
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.6)',
                }}
            />

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
                    const isAnimating = animatingStampIndex === i && isActive
                    const isStampButton = i === card.current && !isComplete && animatingStampIndex === undefined

                    // 도장 찍기 애니메이션 슬롯 (실물 도장 느낌)
                    if (isAnimating) {
                        return (
                            <motion.div
                                key={i}
                                className={cn(
                                    'aspect-square w-full rounded-full flex items-center justify-center',
                                    stampColor, 'text-white',
                                )}
                                style={{
                                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.15), 0 1px 3px -1px rgba(0,0,0,0.1)',
                                }}
                                initial={{ y: -30, scale: 1.4, opacity: 0, rotate: -12 }}
                                animate={{
                                    y: [null, 2, 0],
                                    scale: [null, 0.88, 1],
                                    opacity: [null, 1, 1],
                                    rotate: [null, 2, 0],
                                }}
                                transition={{
                                    duration: 0.8,
                                    times: [0, 0.55, 1],
                                    ease: [0.22, 1, 0.36, 1],
                                    delay: 0.25,
                                }}
                                onAnimationComplete={onAnimationComplete}
                            >
                                {card.stampImage ? (
                                    <img
                                        src={card.stampImage}
                                        alt="stamp"
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <Check size={14} strokeWidth={3} />
                                )}
                            </motion.div>
                        )
                    }

                    // 적립 버튼 슬롯 (애니메이션 중에는 숨김)
                    if (isStampButton) {
                        return (
                            <motion.button
                                key={i}
                                type="button"
                                className={cn(
                                    'aspect-square w-full rounded-full flex items-center justify-center',
                                    'border-2 border-dashed border-kkookk-orange-400',
                                    'bg-kkookk-orange-50 text-kkookk-orange-500',
                                    'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-kkookk-orange-500',
                                )}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                                transition={{
                                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                                    opacity: { duration: 0.25 },
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onStampRequest?.()
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation()
                                    }
                                }}
                                aria-label="스탬프 적립 요청"
                            >
                                <Plus size={14} strokeWidth={3} />
                            </motion.button>
                        )
                    }

                    // 채워진 스탬프 또는 빈 슬롯
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
