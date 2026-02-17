/**
 * StampCardCarousel 컴포넌트
 * 가로형 스탬프 카드 캐러셀 (심플 스케일 전환)
 * - 중앙 카드: 크게 표시, hover/tap으로 3D 플립
 * - 좌우 카드: 중앙 기준 좌우에 작게 + 반투명 (PC/모바일 모두)
 * - 모바일: tap → 플립, 스와이프로 전환, 하단 "스탬프 찍기" 버튼
 * - PC: hover → 플립, click → 적립요청, 가로 스크롤(휠)로 전환
 */

import { useCallback, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { StampCard } from '@/types/domain'
import { StampCardFront } from './StampCardFront'
import { StampCardBack } from './StampCardBack'
import { CardInfoPanel } from './CardInfoPanel'

interface StampCardCarouselProps {
    cards: StampCard[]
    onCardSelect: (card: StampCard) => void
    onCardChange?: (card: StampCard) => void
    className?: string
}

const DRAG_THRESHOLD = 50

const springTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 28,
}

const flipTransition = {
    type: 'spring' as const,
    stiffness: 180,
    damping: 22,
}

function useIsTouchDevice() {
    const [isTouch] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches,
    )
    return isTouch
}

export function StampCardCarousel({
    cards,
    onCardSelect,
    onCardChange,
    className,
}: StampCardCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [slideDirection, setSlideDirection] = useState<1 | -1>(1)
    const isTouchDevice = useIsTouchDevice()
    const wheelAccum = useRef(0)
    const wheelTimer = useRef<ReturnType<typeof setTimeout>>()
    const carouselRef = useRef<HTMLDivElement>(null)

    const goTo = useCallback(
        (index: number, direction?: 1 | -1) => {
            const clamped = Math.max(0, Math.min(index, cards.length - 1))
            if (clamped !== currentIndex) {
                setSlideDirection(direction ?? (clamped > currentIndex ? 1 : -1))
                setCurrentIndex(clamped)
                setIsFlipped(false)
                onCardChange?.(cards[clamped])
            }
        },
        [cards, currentIndex, onCardChange],
    )

    const handleDragEnd = useCallback(
        (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            if (Math.abs(info.offset.x) > DRAG_THRESHOLD) {
                if (info.offset.x > 0 && currentIndex > 0) {
                    goTo(currentIndex - 1, -1)
                } else if (info.offset.x < 0 && currentIndex < cards.length - 1) {
                    goTo(currentIndex + 1, 1)
                }
            }
        },
        [currentIndex, cards.length, goTo],
    )

    const handleCenterClick = useCallback(() => {
        if (isTouchDevice) {
            setIsFlipped((prev) => !prev)
        } else {
            onCardSelect(cards[currentIndex])
        }
    }, [isTouchDevice, onCardSelect, cards, currentIndex])

    const handleHoverStart = useCallback(() => {
        if (!isTouchDevice) {
            setIsFlipped(true)
        }
    }, [isTouchDevice])

    const handleHoverEnd = useCallback(() => {
        if (!isTouchDevice) {
            setIsFlipped(false)
        }
    }, [isTouchDevice])

    // PC: 가로 스크롤(휠/트랙패드)로 캐러셀 전환
    // 항상 preventDefault로 Mac 브라우저 뒤로/앞으로 방지
    // delta 누적 방식으로 트랙패드 민감도 개선
    useEffect(() => {
        const el = carouselRef.current
        if (!el || isTouchDevice) return

        const ACCUM_THRESHOLD = 15

        const handleWheel = (e: WheelEvent) => {
            // 항상 preventDefault → Mac 브라우저 뒤로가기/앞으로가기 방지
            e.preventDefault()

            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            wheelAccum.current += delta

            // 리셋 타이머: 스크롤 멈추면 누적값 초기화
            clearTimeout(wheelTimer.current)
            wheelTimer.current = setTimeout(() => { wheelAccum.current = 0 }, 150)

            if (Math.abs(wheelAccum.current) >= ACCUM_THRESHOLD) {
                const dir = wheelAccum.current > 0 ? 1 : -1
                wheelAccum.current = 0
                if (dir > 0) {
                    goTo(currentIndex + 1, 1)
                } else {
                    goTo(currentIndex - 1, -1)
                }
            }
        }

        el.addEventListener('wheel', handleWheel, { passive: false })
        return () => {
            el.removeEventListener('wheel', handleWheel)
            clearTimeout(wheelTimer.current)
        }
    }, [currentIndex, goTo, isTouchDevice])

    // 키보드 네비게이션
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    goTo(currentIndex - 1)
                    break
                case 'ArrowRight':
                    goTo(currentIndex + 1)
                    break
                case 'Enter':
                case ' ':
                    e.preventDefault()
                    setIsFlipped((prev) => !prev)
                    break
                case 'Escape':
                    setIsFlipped(false)
                    break
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentIndex, goTo])

    const currentCard = cards[currentIndex]
    const prevCard = currentIndex > 0 ? cards[currentIndex - 1] : null
    const nextCard = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null

    // 좌우 카드 위치: 중앙 카드 기준 좌우로 배치 (PC에서도 보이게)
    const SIDE_OFFSET = 58 // 중앙에서 좌/우 %

    return (
        <div
            className={cn('flex flex-col items-center', className)}
            role="region"
            aria-label="스탬프 카드 캐러셀"
            aria-roledescription="carousel"
        >
            {/* 캐러셀 영역 - 100vw */}
            <div
                ref={carouselRef}
                className="relative w-screen overflow-hidden flex items-center justify-center"
                style={{
                    perspective: '1200px',
                    height: '240px',
                }}
            >
                {/* 좌측 카드 (중앙 기준 왼쪽) */}
                <AnimatePresence mode="popLayout">
                    {prevCard && (
                        <motion.div
                            key={`prev-${prevCard.id}`}
                            className="absolute cursor-pointer"
                            style={{
                                width: '70%',
                                maxWidth: 300,
                                zIndex: 1,
                                left: '50%',
                            }}
                            initial={{ opacity: 0, x: `-${SIDE_OFFSET + 40}%` }}
                            animate={{ opacity: 0.5, x: `-${SIDE_OFFSET + 50}%`, scale: 0.8 }}
                            exit={{ opacity: 0, x: `-${SIDE_OFFSET + 40}%` }}
                            transition={springTransition}
                            onClick={() => goTo(currentIndex - 1)}
                        >
                            <StampCardFront card={prevCard} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 중앙 카드 (3D 플립) */}
                <motion.div
                    className="relative cursor-pointer isolate"
                    style={{ width: '78%', maxWidth: 340, zIndex: 10 }}
                    {...(isTouchDevice ? {
                        drag: 'x' as const,
                        dragConstraints: { left: 0, right: 0 },
                        dragElastic: 0.15,
                        dragMomentum: false,
                        onDragEnd: handleDragEnd,
                        whileDrag: { scale: 0.97 },
                    } : {})}
                    onHoverStart={handleHoverStart}
                    onHoverEnd={handleHoverEnd}
                    transition={springTransition}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${currentIndex + 1} / ${cards.length}: ${currentCard?.storeName}`}
                    tabIndex={0}
                >
                    {/* 그림자 - 3D 컨테이너 바깥, 부드러운 디퓨즈 */}
                    <div
                        className="absolute -inset-2 rounded-3xl pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.12) 0%, transparent 70%)',
                            filter: 'blur(12px)',
                            transform: 'translateY(8px)',
                        }}
                    />

                    <motion.div
                        className="relative"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={flipTransition}
                        onClick={handleCenterClick}
                    >
                        {/* 불투명 백킹: 사이드 카드가 비치는 것 차단 (앞면용/뒷면용) */}
                        <div
                            className="absolute inset-0 rounded-2xl bg-white"
                            style={{ transform: 'translateZ(-1px)', backfaceVisibility: 'hidden' }}
                        />
                        <div
                            className="absolute inset-0 rounded-2xl bg-white"
                            style={{ transform: 'rotateY(180deg) translateZ(-1px)', backfaceVisibility: 'hidden' }}
                        />

                        {/* 앞면 */}
                        <div style={{ backfaceVisibility: 'hidden' }}>
                            <StampCardFront card={currentCard} />
                        </div>

                        {/* 뒷면 */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <StampCardBack card={currentCard} />
                        </div>
                    </motion.div>
                </motion.div>

                {/* 우측 카드 (중앙 기준 오른쪽) */}
                <AnimatePresence mode="popLayout">
                    {nextCard && (
                        <motion.div
                            key={`next-${nextCard.id}`}
                            className="absolute cursor-pointer"
                            style={{
                                width: '70%',
                                maxWidth: 300,
                                zIndex: 1,
                                left: '50%',
                            }}
                            initial={{ opacity: 0, x: `${SIDE_OFFSET - 10}%` }}
                            animate={{ opacity: 0.5, x: `${SIDE_OFFSET - 50}%`, scale: 0.8 }}
                            exit={{ opacity: 0, x: `${SIDE_OFFSET - 10}%` }}
                            transition={springTransition}
                            onClick={() => goTo(currentIndex + 1)}
                        >
                            <StampCardFront card={nextCard} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 카드 정보: 가게 이름만 + 모바일만 버튼 */}
            {currentCard && (
                <CardInfoPanel
                    card={currentCard}
                    onStampClick={() => onCardSelect(currentCard)}
                    showButton={isTouchDevice}
                    direction={slideDirection}
                    className="mt-5"
                />
            )}
        </div>
    )
}

export default StampCardCarousel
