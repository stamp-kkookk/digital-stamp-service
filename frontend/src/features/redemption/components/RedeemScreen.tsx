/**
 * RedeemScreen 컴포넌트
 * "사장님 확인중" 화면 → 직원 확인 모달 → 단일 API 호출로 리딤 처리
 */

import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { StaffConfirmModal } from './StaffConfirmModal';
import { RedeemResultView } from './RedeemResultView';
import { Button } from '@/components/ui/Button';
import { useRedeemReward } from '../hooks/useRedeem';

type RedeemState = 'confirming' | 'completing' | 'success' | 'failed';

export function RedeemScreen() {
  const { customerNavigate } = useCustomerNavigate();
  const { redeemId } = useParams<{ redeemId: string }>();

  const [redeemState, setRedeemState] = useState<RedeemState>('confirming');
  const [showStaffConfirm, setShowStaffConfirm] = useState(false);
  const redeemReward = useRedeemReward();

  const handleStaffConfirm = useCallback(() => {
    setShowStaffConfirm(false);
    if (!redeemId) return;

    setRedeemState('completing');
    redeemReward.mutate(
      { walletRewardId: Number(redeemId) },
      {
        onSuccess: () => {
          setRedeemState('success');
        },
        onError: () => {
          setRedeemState('failed');
        },
      }
    );
  }, [redeemId, redeemReward]);

  const handleStaffCancel = useCallback(() => {
    setShowStaffConfirm(false);
  }, []);

  const handleBackToList = useCallback(() => {
    customerNavigate('/redeems');
  }, [customerNavigate]);

  // Completing state
  if (redeemState === 'completing') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-red-50">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-orange-500" />
        <p className="mt-4 text-kkookk-steel">리워드 사용 처리 중...</p>
      </div>
    );
  }

  // Success state
  if (redeemState === 'success') {
    return <RedeemResultView success={true} onConfirm={handleBackToList} />;
  }

  // Failed state
  if (redeemState === 'failed') {
    return <RedeemResultView success={false} onConfirm={handleBackToList} />;
  }

  // Confirming state — "사장님 확인중" 화면
  return (
    <div className="h-full flex flex-col p-6 justify-center text-center bg-red-50 relative">
      <div className="flex-1 flex flex-col justify-center w-full">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
          <h2 className="text-xl font-bold text-kkookk-red mb-2">
            사장님 확인 중
          </h2>
          <p className="text-kkookk-steel text-sm mb-6">
            화면을 직원에게 보여주세요
          </p>

          {/* 직원 액션 버튼 */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <Button
              onClick={() => setShowStaffConfirm(true)}
              variant="navy"
              size="full"
              className="animate-pulse text-lg"
            >
              사용 처리 완료 (직원용)
            </Button>
            <p className="text-[10px] text-kkookk-steel mt-3">
              직원이 직접 버튼을 눌러주세요
            </p>
          </div>
        </div>
      </div>

      {/* 직원 확인 모달 (2차 확인) */}
      <StaffConfirmModal
        isOpen={showStaffConfirm}
        onConfirm={handleStaffConfirm}
        onCancel={handleStaffCancel}
      />
    </div>
  );
}

export default RedeemScreen;
