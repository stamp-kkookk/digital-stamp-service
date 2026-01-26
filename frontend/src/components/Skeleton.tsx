import { twMerge } from 'tailwind-merge'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    style?: React.CSSProperties
}

export function Skeleton({ className, variant = 'rectangular', style }: SkeletonProps) {
    return (
        <div
            className={twMerge(
                'animate-pulse bg-kkookk-sand',
                variant === 'text' && 'h-4 rounded',
                variant === 'circular' && 'rounded-full',
                variant === 'rectangular' && 'rounded-2xl',
                className
            )}
            style={style}
        />
    )
}

export function StampCardCreationSkeleton() {
    return (
        <div className="min-h-screen bg-kkookk-paper">
            {/* Header Skeleton */}
            <header className="flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-black/5">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" className="w-8 h-8" />
                    <Skeleton variant="text" className="w-20 h-4" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-24" />
                    <Skeleton className="h-11 w-16" />
                </div>
            </header>

            {/* Three-panel skeleton */}
            <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)]">
                {/* Left Panel */}
                <div className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-black/5 bg-white p-6">
                    <Skeleton variant="text" className="w-32 h-6 mb-6" />
                    <div className="flex gap-2 mb-6">
                        <Skeleton className="flex-1 h-11" />
                        <Skeleton className="flex-1 h-11" />
                    </div>
                    <Skeleton className="w-full aspect-square mb-6" />
                    <Skeleton className="w-full aspect-square mb-6" />
                    <Skeleton className="w-full aspect-square" />
                </div>

                {/* Center Panel */}
                <div className="flex-1 flex flex-col items-center gap-6 lg:gap-8 p-4 lg:p-8">
                    <Skeleton className="h-11 w-64" />
                    <Skeleton className="rounded-3xl" style={{ width: 'min(340px, 92vw)', height: 'min(680px, 75vh)' }} />
                </div>

                {/* Right Panel */}
                <div className="w-full lg:w-[320px] border-t lg:border-t-0 lg:border-l border-black/5 bg-white p-6">
                    <Skeleton variant="text" className="w-32 h-6 mb-6" />
                    <div className="mb-6">
                        <Skeleton variant="text" className="w-20 h-4 mb-3" />
                        <Skeleton className="w-full h-14" />
                    </div>
                    <div className="mb-6">
                        <Skeleton variant="text" className="w-20 h-4 mb-3" />
                        <Skeleton className="w-full h-14" />
                    </div>
                    <div className="mb-6">
                        <Skeleton variant="text" className="w-20 h-4 mb-3" />
                        <Skeleton className="w-full h-14" />
                    </div>
                </div>
            </div>
        </div>
    )
}
