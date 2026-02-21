/**
 * StampCardCarousel 컴포넌트
 * CSS scroll-snap 기반 가로 캐러셀
 * - 모바일: 네이티브 터치 스크롤 (관성, 러버밴드 자동)
 * - PC: 휠/트랙패드로 카드 단위 이동
 * - 스크롤 중 카드 스케일/투명도 자연스럽게 변화
 * - 센터 카드 탭으로 3D 플립 (앞면 ↔ 뒷면)
 */

import { useCallback, useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { StampCard } from '@/types/domain'
import { StampCardFront } from './StampCardFront'
import { StampCardBack } from './StampCardBack'
import { StampCardFrontV2 } from './StampCardFrontV2'
import { StampCardBackV2 } from './StampCardBackV2'
import { CardInfoPanel } from './CardInfoPanel'
import { isDesignV2, parseDesignJsonV2 } from '../utils/cardDesign'

interface StampCardCarouselProps {
    cards: StampCard[]
    initialIndex?: number
    onCardChange?: (card: StampCard) => void
    onStampRequest?: (card: StampCard) => void
    initialFlipped?: boolean
    animatingStampIndex?: number
    onAnimationComplete?: () => void
    className?: string
}

const CARD_GAP = 16
const CARD_WIDTH_RATIO = 0.78
const CARD_MAX_WIDTH = 340

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
    initialIndex = 0,
    onCardChange,
    onStampRequest,
    initialFlipped,
    animatingStampIndex,
    onAnimationComplete,
    className,
}: StampCardCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [isFlipped, setIsFlipped] = useState(initialFlipped ?? false)
    const [slideDirection, setSlideDirection] = useState<1 | -1>(1)
    const isTouchDevice = useIsTouchDevice()

    const scrollRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const scaleRefs = useRef<(HTMLDivElement | null)[]>([])
    const currentIndexRef = useRef(currentIndex)
    const isScrolling = useRef(false)
    const scrollTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
    const wheelAccum = useRef(0)
    const wheelTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 375
    const cardWidth = Math.min(containerWidth * CARD_WIDTH_RATIO, CARD_MAX_WIDTH)
    const cardSpacing = cardWidth + CARD_GAP
    const sidePadding = (containerWidth - cardWidth) / 2

    currentIndexRef.current = currentIndex

    // ── 카드로 스크롤 ──

    const scrollToCard = useCallback(
        (index: number, behavior: ScrollBehavior = 'smooth') => {
            const container = scrollRef.current
            if (!container) return
            const clamped = Math.max(0, Math.min(index, cards.length - 1))
            container.scrollTo({ left: clamped * cardSpacing, behavior })
        },
        [cards.length, cardSpacing],
    )

    const goTo = useCallback(
        (index: number, direction?: 1 | -1) => {
            const clamped = Math.max(0, Math.min(index, cards.length - 1))
            if (clamped !== currentIndexRef.current) {
                setSlideDirection(direction ?? (clamped > currentIndexRef.current ? 1 : -1))
                scrollToCard(clamped)
            }
        },
        [cards.length, scrollToCard],
    )

    // ── 스크롤 핸들러: 스케일/투명도 + 현재 인덱스 ──

    const handleScroll = useCallback(() => {
        const container = scrollRef.current
        if (!container) return

        const containerRect = container.getBoundingClientRect()
        const viewportCenterX = containerRect.left + containerRect.width / 2

        isScrolling.current = true
        clearTimeout(scrollTimeout.current)
        scrollTimeout.current = setTimeout(() => {
            isScrolling.current = false
        }, 150)

        let nearestIndex = 0
        let nearestDist = Infinity

        cards.forEach((_, i) => {
            const cardEl = cardRefs.current[i]
            const scaleEl = scaleRefs.current[i]
            if (!cardEl || !scaleEl) return

            const cardRect = cardEl.getBoundingClientRect()
            const cardCenterX = cardRect.left + cardRect.width / 2
            const distance = Math.abs(viewportCenterX - cardCenterX)
            const normalized = Math.min(distance / cardSpacing, 1.5)

            const scale = 1 - Math.min(normalized, 1) * 0.15
            const opacity = 1 - Math.min(normalized, 1) * 0.5

            scaleEl.style.transform = `scale(${scale})`
            scaleEl.style.opacity = `${opacity}`

            if (distance < nearestDist) {
                nearestDist = distance
                nearestIndex = i
            }
        })

        if (nearestIndex !== currentIndexRef.current) {
            const prev = currentIndexRef.current
            currentIndexRef.current = nearestIndex
            setCurrentIndex(nearestIndex)
            setSlideDirection(nearestIndex > prev ? 1 : -1)
            setIsFlipped(false)
            onCardChange?.(cards[nearestIndex])
        }
    }, [cards, cardSpacing, onCardChange])

    // 스크롤 리스너
    useEffect(() => {
        const container = scrollRef.current
        if (!container) return
        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => container.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // 초기 위치 + 스케일
    useEffect(() => {
        scrollToCard(initialIndex, 'auto')
        requestAnimationFrame(handleScroll)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── PC: 휠/트랙패드 → 카드 단위 이동 ──

    useEffect(() => {
        const container = scrollRef.current
        if (!container || isTouchDevice) return

        const ACCUM_THRESHOLD = 15

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            wheelAccum.current += delta

            clearTimeout(wheelTimer.current)
            wheelTimer.current = setTimeout(() => {
                wheelAccum.current = 0
            }, 150)

            if (Math.abs(wheelAccum.current) >= ACCUM_THRESHOLD) {
                const dir = wheelAccum.current > 0 ? 1 : -1
                wheelAccum.current = 0
                goTo(currentIndexRef.current + dir, dir as 1 | -1)
            }
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => {
            container.removeEventListener('wheel', handleWheel)
            clearTimeout(wheelTimer.current)
        }
    }, [goTo, isTouchDevice])

    // ── 키보드 ──

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    goTo(currentIndexRef.current - 1)
                    break
                case 'ArrowRight':
                    goTo(currentIndexRef.current + 1)
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
    }, [goTo])

    // ── 카드 클릭/탭 ──

    const handleCardClick = useCallback(
        (index: number) => {
            if (isScrolling.current) return
            if (index === currentIndexRef.current) {
                setIsFlipped((prev) => !prev)
            } else {
                goTo(index)
            }
        },
        [goTo],
    )

    const currentCard = cards[currentIndex]

    return (
        <div
            className={cn('flex flex-col items-center', className)}
            role="region"
            aria-label="스탬프 카드 캐러셀"
            aria-roledescription="carousel"
        >
            {/* 스크롤 캐러셀 — 네이티브 터치 스크롤 + snap */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar items-center w-screen"
                style={{ height: '240px' }}
            >
                {/* 좌측 여백 (첫 카드 센터링) */}
                <div className="flex-shrink-0" style={{ width: sidePadding }} />

                {cards.map((card, i) => (
                    <div
                        key={card.id}
                        ref={(el) => {
                            cardRefs.current[i] = el
                        }}
                        className="snap-center flex-shrink-0"
                        style={{
                            width: cardWidth,
                            marginRight: i < cards.length - 1 ? CARD_GAP : 0,
                        }}
                    >
                        {/* 스케일/투명도 래퍼 (스크롤 위치 기반 DOM 직접 조작) */}
                        <div
                            ref={(el) => {
                                scaleRefs.current[i] = el
                            }}
                            className="will-change-transform"
                            style={{
                                transformOrigin: 'center center',
                                transformStyle: 'preserve-3d',
                                transition: 'none',
                            }}
                        >
                            <div className="relative" style={{ perspective: '1200px' }}>
                                {/* 그림자 */}
                                <div
                                    className="absolute -inset-2 rounded-3xl pointer-events-none"
                                    style={{
                                        background:
                                            'radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0.12) 0%, transparent 70%)',
                                        filter: 'blur(12px)',
                                        transform: 'translateY(8px)',
                                    }}
                                />

                                {/* 3D 플립 */}
                                <motion.div
                                    className="relative cursor-pointer"
                                    style={{ transformStyle: 'preserve-3d' }}
                                    animate={{ rotateY: isFlipped && i === currentIndex ? 180 : 0 }}
                                    transition={flipTransition}
                                    onClick={() => handleCardClick(i)}
                                    role="group"
                                    aria-roledescription="slide"
                                    aria-label={`${i + 1} / ${cards.length}: ${card.storeName}`}
                                    tabIndex={i === currentIndex ? 0 : -1}
                                >
                                    {/* 불투명 백킹 */}
                                    <div
                                        className="absolute inset-0 rounded-2xl bg-white"
                                        style={{
                                            transform: 'translateZ(-1px)',
                                            backfaceVisibility: 'hidden',
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 rounded-2xl bg-white"
                                        style={{
                                            transform: 'rotateY(180deg) translateZ(-1px)',
                                            backfaceVisibility: 'hidden',
                                        }}
                                    />

                                    {/* 앞면 */}
                                    <div style={{ backfaceVisibility: 'hidden' }}>
                                        {(() => {
                                            const v2Design = isDesignV2(card.designJsonRaw ?? null)
                                                ? parseDesignJsonV2(card.designJsonRaw ?? null)
                                                : null;
                                            if (v2Design) return <StampCardFrontV2 design={v2Design} />;
                                            return <StampCardFront card={card} />;
                                        })()}
                                    </div>

                                    {/* 뒷면 */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                        }}
                                    >
                                        {(() => {
                                            const v2Design = isDesignV2(card.designJsonRaw ?? null)
                                                ? parseDesignJsonV2(card.designJsonRaw ?? null)
                                                : null;
                                            if (v2Design) {
                                                return (
                                                    <StampCardBackV2
                                                        design={v2Design}
                                                        stampCount={card.current}
                                                        onStampRequest={
                                                            i === currentIndex
                                                                ? () => onStampRequest?.(card)
                                                                : undefined
                                                        }
                                                        animatingStampIndex={
                                                            i === currentIndex ? animatingStampIndex : undefined
                                                        }
                                                        onAnimationComplete={
                                                            i === currentIndex ? onAnimationComplete : undefined
                                                        }
                                                    />
                                                );
                                            }
                                            return (
                                                <StampCardBack
                                                    card={card}
                                                    onStampRequest={
                                                        i === currentIndex
                                                            ? () => onStampRequest?.(card)
                                                            : undefined
                                                    }
                                                    animatingStampIndex={
                                                        i === currentIndex ? animatingStampIndex : undefined
                                                    }
                                                    onAnimationComplete={
                                                        i === currentIndex ? onAnimationComplete : undefined
                                                    }
                                                />
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* 우측 여백 (마지막 카드 센터링) */}
                <div className="flex-shrink-0" style={{ width: sidePadding }} />
            </div>

            {/* 카드 정보 */}
            {currentCard && <CardInfoPanel card={currentCard} direction={slideDirection} className="mt-5" />}
        </div>
    )
}

export default StampCardCarousel
