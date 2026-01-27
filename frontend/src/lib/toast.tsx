import { toast } from 'sonner'

export { Toaster } from '@/components/ui/sonner'

/**
 * Toast utilities using Sonner
 * KKOOKK 브랜드 스타일 적용
 */
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
    })
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
    })
  },

  warning: (message: string) => {
    toast.warning(message, {
      duration: 3500,
    })
  },

  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
    })
  },

  loading: (message: string) => {
    return toast.loading(message)
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },
}
