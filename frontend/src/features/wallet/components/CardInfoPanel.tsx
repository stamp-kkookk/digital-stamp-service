/**
 * CardInfoPanel 컴포넌트
 * 캐러셀 카드 아래: 가게 이름만 표시
 */

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { StampCard } from '@/types/domain'

interface CardInfoPanelProps {
    card: StampCard
    direction?: 1 | -1
    className?: string
}

export function CardInfoPanel({ card, direction = 1, className }: CardInfoPanelProps) {
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
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default CardInfoPanel
