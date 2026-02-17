/**
 * CardInfoPanel 컴포넌트
 * 캐러셀 카드 아래: 가게 이름만 표시
 * 모바일에서만 "스탬프 찍기" 버튼 표시 (showButton)
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { StampCard } from '@/types/domain'

interface CardInfoPanelProps {
    card: StampCard
    onStampClick: () => void
    showButton?: boolean
    direction?: 1 | -1
    className?: string
}

export function CardInfoPanel({ card, onStampClick, showButton = true, direction = 1, className }: CardInfoPanelProps) {
    const isComplete = card.current >= card.max
    const slideX = 40 * direction

    return (
        <div className={cn('w-full max-w-85 mx-auto overflow-hidden', className)}>
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: slideX }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -slideX }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="flex flex-col items-center"
                >
                    {/* 매장명 */}
                    <h2
                        className="text-lg font-bold text-kkookk-navy"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        {card.storeName}
                    </h2>

                    {/* 액션 버튼 (모바일에서만) */}
                    {showButton && (
                        <div className="mt-4 w-full">
                            {isComplete ? (
                                <Button
                                    onClick={onStampClick}
                                    variant="navy"
                                    size="full"
                                    className="h-12 rounded-xl text-sm font-bold"
                                >
                                    <Smartphone size={16} className="mr-1.5" />
                                    리워드 사용하기
                                </Button>
                            ) : (
                                <Button
                                    onClick={onStampClick}
                                    variant="primary"
                                    size="full"
                                    className="h-12 rounded-xl text-sm font-bold"
                                    style={{
                                        boxShadow: '0 4px 14px -3px rgba(255, 77, 0, 0.4), 0 2px 6px -2px rgba(255, 77, 0, 0.2)',
                                    }}
                                >
                                    스탬프 찍기
                                </Button>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default CardInfoPanel
