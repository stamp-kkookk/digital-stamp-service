/**
 * KKOOKK Toast 컴포넌트
 * sonner 기반 커스텀 토스트 (꾸욱 브랜드 스타일)
 */

import { Toaster as SonnerToaster, toast } from 'sonner'
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

function KkookkToaster() {
    return (
        <SonnerToaster
            position="top-center"
            offset={24}
            gap={8}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: 'w-full',
                    title: 'text-sm font-semibold',
                    description: 'text-xs mt-0.5',
                    actionButton: 'text-xs font-bold px-3 py-1.5 rounded-xl',
                    closeButton: 'text-kkookk-steel hover:text-kkookk-navy',
                },
            }}
        />
    )
}

interface ToastOptions {
    description?: string
    action?: { label: string; onClick: () => void }
    duration?: number
}

function showSuccess(title: string, options?: ToastOptions) {
    toast.custom(
        (id) => (
            <ToastCard
                id={id}
                icon={<CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />}
                title={title}
                description={options?.description}
                action={options?.action}
                variant="success"
            />
        ),
        { duration: options?.duration ?? 2000 }
    )
}

function showError(title: string, options?: ToastOptions) {
    toast.custom(
        (id) => (
            <ToastCard
                id={id}
                icon={<AlertCircle size={20} className="text-kkookk-red shrink-0 mt-0.5" />}
                title={title}
                description={options?.description}
                action={options?.action}
                variant="error"
            />
        ),
        { duration: options?.duration ?? 2700 }
    )
}

function showInfo(title: string, options?: ToastOptions) {
    toast.custom(
        (id) => (
            <ToastCard
                id={id}
                icon={<Info size={20} className="text-kkookk-indigo shrink-0 mt-0.5" />}
                title={title}
                description={options?.description}
                action={options?.action}
                variant="info"
            />
        ),
        { duration: options?.duration ?? 2000 }
    )
}

function showWarning(title: string, options?: ToastOptions) {
    toast.custom(
        (id) => (
            <ToastCard
                id={id}
                icon={<AlertTriangle size={20} className="text-kkookk-amber shrink-0 mt-0.5" />}
                title={title}
                description={options?.description}
                action={options?.action}
                variant="warning"
            />
        ),
        { duration: options?.duration ?? 2300 }
    )
}

const VARIANT_STYLES = {
    success: 'bg-white',
    error: 'bg-white',
    info: 'bg-white',
    warning: 'bg-white',
} as const

interface ToastCardProps {
    id: string | number
    icon: ReactNode
    title: string
    description?: string
    action?: { label: string; onClick: () => void }
    variant: keyof typeof VARIANT_STYLES
}

function ToastCard({ id, icon, title, description, action, variant }: ToastCardProps) {
    const ACTION_STYLES = {
        success: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        error: 'bg-red-50 text-kkookk-red hover:bg-red-100',
        info: 'bg-blue-50 text-kkookk-indigo hover:bg-blue-100',
        warning: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    } as const

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-lg w-[calc(100vw-32px)] sm:w-sm ${VARIANT_STYLES[variant]}`}
        >
            {icon}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-kkookk-navy">{title}</p>
                {description && <p className="text-xs text-kkookk-steel mt-0.5">{description}</p>}
            </div>
            {action && (
                <button
                    onClick={() => {
                        action.onClick()
                        toast.dismiss(id)
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition-colors ${ACTION_STYLES[variant]}`}
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}

const kkookkToast = {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    dismiss: toast.dismiss,
}

// eslint-disable-next-line react-refresh/only-export-components
export { KkookkToaster, kkookkToast }
