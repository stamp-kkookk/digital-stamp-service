import type { ReactNode } from 'react'

// ============================================================================
// Loading View
// ============================================================================

interface LoadingViewProps {
    message?: string
    className?: string
}

export const LoadingView = ({ message = '불러오는 중...', className = '' }: LoadingViewProps) => {
    return (
        <div className={`flex items-center justify-center ${className || 'h-screen'}`} data-testid="loading-component">
            <p className="text-lg text-gray-500">{message}</p>
        </div>
    )
}

// ============================================================================
// Error View
// ============================================================================

interface ErrorViewProps {
    message?: string
    onRetry?: () => void
    className?: string
}

export const ErrorView = ({
    message = '오류가 발생했습니다.',
    onRetry,
    className = '',
}: ErrorViewProps) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className || 'h-screen'}`} data-testid="error-component">
            <p className="text-lg text-red-500">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                    다시 시도
                </button>
            )}
        </div>
    )
}

// ============================================================================
// Empty View
// ============================================================================

interface EmptyViewProps {
    title?: string
    description?: string
    message?: string // For backwards compatibility
    action?: ReactNode
    className?: string
}

export const EmptyView = ({ title, description, message, action, className = '' }: EmptyViewProps) => {
    // Support legacy 'message' prop for backwards compatibility
    const displayTitle = title || (message && !description ? message : undefined)
    const displayDescription = description

    return (
        <div className={`flex flex-col items-center justify-center text-center ${className || 'h-64'}`} data-testid="empty-component">
            {displayTitle && <p className="text-lg text-gray-500">{displayTitle}</p>}
            {displayDescription && <p className="text-sm text-gray-400 mt-2">{displayDescription}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}

// ============================================================================
// Exports for backwards compatibility
// ============================================================================

export default {
    Loading: LoadingView,
    Error: ErrorView,
    Empty: EmptyView,
}
