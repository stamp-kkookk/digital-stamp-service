import React from 'react';
import { Button } from './button';

// ============================================================================
// Loading View
// ============================================================================

interface LoadingViewProps {
  message?: string;
  className?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = '불러오는 중...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${className || 'h-screen'}`}
      role="status"
      aria-live="polite"
    >
      {/* Spinner */}
      <svg
        className="animate-spin h-12 w-12 text-kkookk-orange-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-lg text-kkookk-steel">{message}</p>
    </div>
  );
};

// ============================================================================
// Error View
// ============================================================================

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = '오류가 발생했습니다.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className || 'h-screen'}`}
      role="alert"
    >
      {/* Error Icon */}
      <div className="w-16 h-16 bg-kkookk-red-50 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-kkookk-red"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-lg font-semibold text-kkookk-navy mb-2">오류 발생</p>
      <p className="text-sm text-kkookk-steel mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// Empty View
// ============================================================================

interface EmptyViewProps {
  title?: string;
  description?: string;
  message?: string; // Backwards compatibility
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyView: React.FC<EmptyViewProps> = ({
  title,
  description,
  message,
  action,
  className = '',
}) => {
  // Support legacy 'message' prop
  const displayTitle = title || (message && !description ? message : undefined);
  const displayDescription = description;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className || 'h-64'}`}
    >
      {/* Empty Icon */}
      <div className="w-16 h-16 bg-kkookk-navy-50 rounded-full flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-kkookk-steel"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      {displayTitle && (
        <p className="text-lg font-semibold text-kkookk-navy mb-2">{displayTitle}</p>
      )}
      {displayDescription && (
        <p className="text-sm text-kkookk-steel mb-6 max-w-md">{displayDescription}</p>
      )}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// Default Export (backwards compatibility)
// ============================================================================

export default {
  Loading: LoadingView,
  Error: ErrorView,
  Empty: EmptyView,
};
