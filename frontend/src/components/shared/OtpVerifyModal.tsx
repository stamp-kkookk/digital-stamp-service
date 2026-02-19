/**
 * OtpVerifyModal 컴포넌트
 * StepUpVerify를 모달로 감싸서 현재 페이지 위에 표시
 */

import { Dialog, DialogContent } from '@/components/ui/Modal'
import { StepUpVerify } from '@/components/shared/StepUpVerify'

interface OtpVerifyModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onVerified: () => void
}

export function OtpVerifyModal({ open, onOpenChange, onVerified }: OtpVerifyModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showClose={false}
                className="mx-4 max-w-sm py-10"
                aria-describedby={undefined}
            >
                <StepUpVerify onVerified={onVerified} />
            </DialogContent>
        </Dialog>
    )
}

export default OtpVerifyModal
