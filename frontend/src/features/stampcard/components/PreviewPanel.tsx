import { useState, useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface PreviewPanelProps {
    mode: 'custom' | 'puzzle'
    totalStamps: number
    puzzleGrid: '2x2' | '3x3' | '4x4' | '5x4'
    puzzleImage: string | null
    backgroundImage: string | null
    emptyIcon: string | null
    stampIcon: string | null
    cardTitle: string
    rewardName: string
}

export function PreviewPanel({
    mode,
    totalStamps,
    puzzleGrid,
    puzzleImage,
    backgroundImage,
    emptyIcon,
    stampIcon,
    cardTitle,
    rewardName,
}: PreviewPanelProps) {
    const [viewMode, setViewMode] = useState<'design' | 'simulator'>('design')
    const [collectedStamps, setCollectedStamps] = useState(0)
    const [isStampDisabled, setIsStampDisabled] = useState(false)

    // Helper functions
    const getGridColumns = () => {
        if (totalStamps <= 4) {
            return 2
        }
        if (totalStamps <= 6) {
            return 3
        }
        if (totalStamps <= 9) {
            return 3
        }
        if (totalStamps <= 12) {
            return 4
        }
        if (totalStamps <= 16) {
            return 4
        }
        return 5
    }

    const getPuzzleGridDimensions = () => {
        switch (puzzleGrid) {
            case '2x2':
                return { rows: 2, cols: 2 }
            case '3x3':
                return { rows: 3, cols: 3 }
            case '4x4':
                return { rows: 4, cols: 4 }
            case '5x4':
                return { rows: 4, cols: 5 }
        }
    }

    const getPuzzleTileCount = () => {
        const { rows, cols } = getPuzzleGridDimensions()
        return rows * cols
    }

    // Generate shuffled reveal order for puzzle mode
    const shuffledOrder = useMemo(() => {
        const tileCount = getPuzzleTileCount()
        const indices = Array.from({ length: tileCount }, (_, i) => i)
        // Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[indices[i], indices[j]] = [indices[j], indices[i]]
        }
        return indices
    }, [puzzleGrid])

    const handleStampCollect = () => {
        // Prevent double-tap (300ms)
        if (isStampDisabled) {
            return
        }

        const maxStamps = mode === 'puzzle' ? getPuzzleTileCount() : totalStamps
        if (collectedStamps < maxStamps) {
            setCollectedStamps(collectedStamps + 1)

            // Disable for 300ms
            setIsStampDisabled(true)
            setTimeout(() => {
                setIsStampDisabled(false)
            }, 300)
        }
    }

    const handleReset = () => {
        setCollectedStamps(0)
        setIsStampDisabled(false)
    }

    const renderPuzzleTile = (index: number, rows: number, cols: number) => {
        // Check if this tile is revealed based on shuffled order
        const revealPosition = shuffledOrder.indexOf(index)
        const isRevealed = revealPosition < collectedStamps
        const row = Math.floor(index / cols)
        const col = index % cols

        return (
            <div
                key={index}
                className="aspect-square overflow-hidden relative transition-all"
                style={{
                    background: isRevealed
                        ? puzzleImage
                            ? 'transparent'
                            : '#FFD600' // Yellow fallback if no image
                        : 'linear-gradient(135deg, #1A1C1E 0%, #2d3033 100%)', // Navy gradient for locked
                }}
            >
                {isRevealed && puzzleImage && (
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${puzzleImage})`,
                            backgroundSize: `${cols * 100}% ${rows * 100}%`,
                            backgroundPosition: `${(col / (cols - 1)) * 100}% ${(row / (rows - 1)) * 100}%`,
                        }}
                    />
                )}
            </div>
        )
    }

    const gridCols = getGridColumns()
    const { rows, cols } = getPuzzleGridDimensions()
    const puzzleTileCount = getPuzzleTileCount()
    const maxStamps = mode === 'puzzle' ? puzzleTileCount : totalStamps
    const isComplete = collectedStamps >= maxStamps

    return (
        <div className="flex flex-col items-center gap-6 lg:gap-8 p-4 lg:p-8 h-full overflow-y-auto">
            {/* Segmented Toggle */}
            <div className="inline-flex rounded-3xl p-1 bg-gray-100">
                <button
                    type="button"
                    onClick={() => setViewMode('design')}
                    className={twMerge(
                        'px-6 lg:px-8 h-11 rounded-[20px] transition-all font-medium',
                        'focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30',
                        viewMode === 'design'
                            ? 'bg-white text-kkookk-navy shadow-sm'
                            : 'text-kkookk-steel'
                    )}
                >
                    Design
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('simulator')}
                    className={twMerge(
                        'px-6 lg:px-8 h-11 rounded-[20px] transition-all font-medium',
                        'focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30',
                        viewMode === 'simulator'
                            ? 'bg-white text-kkookk-navy shadow-sm'
                            : 'text-kkookk-steel'
                    )}
                >
                    Simulator
                </button>
            </div>

            {/* Preview Card */}
            <div
                className="rounded-3xl p-6 lg:p-8 relative overflow-hidden flex flex-col bg-white border border-black/5 shadow-lg"
                style={{
                    width: 'min(340px, 92vw)',
                    height: 'min(680px, 75vh)',
                }}
            >
                {/* Background Image Layer */}
                {mode === 'custom' && backgroundImage && (
                    <div
                        className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
                        style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}

                {/* Content Layer */}
                <div className="relative z-10 flex flex-col h-full">
                    {/* Card Title */}
                    {cardTitle && <h3 className="mb-2 text-xl font-semibold text-kkookk-navy">{cardTitle}</h3>}

                    {/* Reward Name */}
                    {rewardName && <p className="mb-4 text-sm text-kkookk-steel">리워드: {rewardName}</p>}

                    {mode === 'custom' ? (
                        <>
                            {/* Stamp Grid */}
                            <div
                                className="grid gap-3 mb-6 flex-1"
                                style={{
                                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                                    alignContent: 'start',
                                }}
                            >
                                {Array.from({ length: totalStamps }).map((_, index) => {
                                    const isCollected = index < collectedStamps
                                    return (
                                        <div
                                            key={index}
                                            className={twMerge(
                                                'aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all border border-black/5',
                                                isCollected ? 'bg-kkookk-indigo' : 'bg-kkookk-sand'
                                            )}
                                        >
                                            {isCollected ? (
                                                stampIcon ? (
                                                    <img
                                                        src={stampIcon}
                                                        alt="Stamp"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-3/4 h-3/4 rounded-full bg-white" />
                                                )
                                            ) : emptyIcon ? (
                                                <img
                                                    src={emptyIcon}
                                                    alt="Empty"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-3/4 h-3/4 rounded-full border-2 border-kkookk-steel" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Progress Text */}
                            <div className="mb-6 text-center">
                                <p className="text-kkookk-steel">
                                    {collectedStamps} / {totalStamps} 스탬프 적립
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Puzzle Grid - NO GAP */}
                            <div
                                className="grid gap-0 mb-6 overflow-hidden rounded-2xl flex-1 border border-black/5"
                                style={{
                                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                    alignContent: 'start',
                                }}
                            >
                                {Array.from({ length: puzzleTileCount }).map((_, index) =>
                                    renderPuzzleTile(index, rows, cols)
                                )}
                            </div>

                            {/* Progress Text */}
                            <div className="mb-6 text-center">
                                <p className="text-kkookk-steel">
                                    {collectedStamps} / {puzzleTileCount} 조각 공개
                                </p>
                            </div>
                        </>
                    )}

                    {/* Simulator Buttons - ONLY in Simulator Mode */}
                    {viewMode === 'simulator' && (
                        <div className="flex gap-3 mt-auto">
                            {!isComplete ? (
                                <button
                                    type="button"
                                    onClick={handleStampCollect}
                                    disabled={isStampDisabled}
                                    className="flex-1 h-14 rounded-[20px] transition-all hover:opacity-90 bg-kkookk-indigo text-white font-semibold focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    스탬프 적립
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="flex-1 h-14 rounded-[20px] transition-all hover:opacity-90 bg-kkookk-indigo text-white font-semibold focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30"
                                >
                                    리워드 쿠폰 받기
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleReset}
                                className="h-14 px-6 rounded-[20px] transition-all bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-kkookk-steel focus:outline-none focus:ring-4 focus:ring-kkookk-indigo/30"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
