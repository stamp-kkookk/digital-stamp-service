import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      className="toaster group"
      toastOptions={{
        style: {
          background: '#1A1C1E', // kkookk-navy
          color: '#FAF9F6', // kkookk-paper
          borderRadius: '1rem', // 16px
          padding: '16px',
          fontFamily: 'Pretendard Variable, -apple-system, sans-serif',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#FF4D00]" />,
        info: <InfoIcon className="size-4 text-[#2E58FF]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#F59E0B]" />,
        error: <OctagonXIcon className="size-4 text-[#DC2626]" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#FF4D00]" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
