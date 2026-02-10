/**
 * StaffConfirmModal 컴포넌트
 * 리딤 2단계 확인 모달 (PRD 보안 요구사항)
 * 직원이 고객 휴대폰에서 확인해야 리딤 완료
 */

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StaffConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function StaffConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: StaffConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-kkookk-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-100 text-kkookk-red rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-kkookk-navy mb-2">직원 확인</h3>
          <p className="text-sm text-kkookk-steel">
            지금 사용 처리하면 되돌릴 수 없습니다.
            <br />
            매장에서 확인 후 진행해 주세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="subtle"
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={onConfirm}
            variant="navy"
            className="flex-1 shadow-lg"
          >
            확인 완료
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StaffConfirmModal;
