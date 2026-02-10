/**
 * RedeemScreen 컴포넌트
 * TTL 카운트다운 및 직원 확인 기능이 포함된 메인 리딤 화면
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { TTLCountdown } from './TTLCountdown';
import { StaffConfirmModal } from './StaffConfirmModal';
import { RedeemResultView } from './RedeemResultView';
import { Button } from '@/components/ui/Button';
import { useCreateRedeemSession, useCompleteRedeemSession } from '../hooks/useRedeem';

type RedeemState = 'loading' | 'confirming' | 'completing' | 'success' | 'failed';

export function RedeemScreen() {
  const { customerNavigate } = useCustomerNavigate();
  const { redeemId } = useParams<{ redeemId: string }>();

  const [redeemState, setRedeemState] = useState<RedeemState>('loading');
  const [showStaffConfirm, setShowStaffConfirm] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const createSession = useCreateRedeemSession();
  const completeSession = useCompleteRedeemSession();

  // 세션 생성 (마운트 시)
  useEffect(() => {
    if (!redeemId) return;

    createSession.mutate(
      { walletRewardId: Number(redeemId) },
      {
        onSuccess: (data) => {
          setSessionId(data.sessionId);
          setRemainingSeconds(data.remainingSeconds);
          setRedeemState('confirming');
        },
        onError: () => {
          setRedeemState('failed');
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redeemId]);

  // TTL 카운트다운
  useEffect(() => {
    if (redeemState !== 'confirming') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setRedeemState('failed');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [redeemState]);

  const handleStaffConfirm = useCallback(() => {
    setShowStaffConfirm(false);
    if (!sessionId) return;

    setRedeemState('completing');
    completeSession.mutate(sessionId, {
      onSuccess: () => {
        setRedeemState('success');
      },
      onError: () => {
        setRedeemState('failed');
      },
    });
  }, [sessionId, completeSession]);

  const handleStaffCancel = useCallback(() => {
    setShowStaffConfirm(false);
  }, []);

  const handleBackToList = useCallback(() => {
    customerNavigate('/redeems');
  }, [customerNavigate]);

  // Loading state (세션 생성 중)
  if (redeemState === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-red-50">
        <Loader2 className="w-8 h-8 animate-spin text-kkookk-orange-500" />
        <p className="mt-4 text-kkookk-steel">리워드 사용 준비 중...</p>
      </div>
    );
  }

  // Success state
  if (redeemState === 'success') {
    return (
      <RedeemResultView
        success={true}
        onConfirm={handleBackToList}
      />
    );
  }

  // Failed state (including TTL expired)
  if (redeemState === 'failed') {
    return (
      <RedeemResultView
        success={false}
        onConfirm={handleBackToList}
      />
    );
  }

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

          {/* TTL 카운트다운 */}
          <div className="mb-6">
            <TTLCountdown seconds={remainingSeconds} />
          </div>

          {/* 직원 액션 버튼 */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <Button
              onClick={() => setShowStaffConfirm(true)}
              variant="navy"
              size="full"
              disabled={redeemState === 'completing'}
              className="animate-pulse text-lg"
            >
              {redeemState === 'completing' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  처리 중...
                </span>
              ) : (
                '사용 처리 완료 (직원용)'
              )}
            </Button>
            <p className="text-[10px] text-kkookk-steel mt-3">
              직원이 직접 버튼을 눌러주세요
            </p>
          </div>
        </div>
      </div>

      {/* 직원 확인 모달 (PRD에 따른 2단계 확인) */}
      <StaffConfirmModal
        isOpen={showStaffConfirm}
        onConfirm={handleStaffConfirm}
        onCancel={handleStaffCancel}
      />
    </div>
  );
}

export default RedeemScreen;
