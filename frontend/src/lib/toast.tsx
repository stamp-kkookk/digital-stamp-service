import toast, { Toaster as HotToaster } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

/**
 * Custom styled Toaster component
 */
export function Toaster() {
    return (
        <HotToaster
            position="bottom-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#1A1C1E',
                    color: '#FAF9F6',
                    padding: '16px',
                    borderRadius: '16px',
                    fontFamily: 'Pretendard Variable, -apple-system, sans-serif',
                    fontSize: '14px',
                    maxWidth: '500px',
                },
                success: {
                    iconTheme: {
                        primary: '#FF4D00',
                        secondary: '#FAF9F6',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#DC2626',
                        secondary: '#FAF9F6',
                    },
                },
            }}
        />
    )
}

/**
 * Toast utilities
 */
export const showToast = {
    success: (message: string) => {
        toast.custom(
            (t) => (
                <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all ${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    }`}
                    style={{
                        backgroundColor: '#1A1C1E',
                        color: '#FAF9F6',
                    }}
                >
                    <CheckCircle size={20} className="text-[#FF4D00] flex-shrink-0" />
                    <span className="text-sm font-medium">{message}</span>
                </div>
            ),
            { duration: 3000 }
        )
    },

    error: (message: string) => {
        toast.custom(
            (t) => (
                <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all ${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    }`}
                    style={{
                        backgroundColor: '#1A1C1E',
                        color: '#FAF9F6',
                    }}
                >
                    <XCircle size={20} className="text-[#DC2626] flex-shrink-0" />
                    <span className="text-sm font-medium">{message}</span>
                </div>
            ),
            { duration: 4000 }
        )
    },

    warning: (message: string) => {
        toast.custom(
            (t) => (
                <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all ${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    }`}
                    style={{
                        backgroundColor: '#1A1C1E',
                        color: '#FAF9F6',
                    }}
                >
                    <AlertCircle size={20} className="text-[#F59E0B] flex-shrink-0" />
                    <span className="text-sm font-medium">{message}</span>
                </div>
            ),
            { duration: 3500 }
        )
    },

    info: (message: string) => {
        toast.custom(
            (t) => (
                <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all ${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    }`}
                    style={{
                        backgroundColor: '#1A1C1E',
                        color: '#FAF9F6',
                    }}
                >
                    <Info size={20} className="text-[#2E58FF] flex-shrink-0" />
                    <span className="text-sm font-medium">{message}</span>
                </div>
            ),
            { duration: 3000 }
        )
    },

    loading: (message: string) => {
        return toast.loading(message, {
            style: {
                background: '#1A1C1E',
                color: '#FAF9F6',
            },
        })
    },

    dismiss: (toastId?: string) => {
        toast.dismiss(toastId)
    },
}
