/**
 * CustomerSettingsPage 컴포넌트
 * 고객 앱 설정 페이지
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Clock } from 'lucide-react';
import { useCustomerNavigate } from '@/hooks/useCustomerNavigate';
import { isStepUpValid, getStepUpRemainingSeconds } from '@/lib/api/tokenManager';
import { StepUpVerify } from '@/components/shared/StepUpVerify';

export function CustomerSettingsPage() {
  const { customerNavigate } = useCustomerNavigate();
  const [stepUpValid, setStepUpValid] = useState(isStepUpValid());
  const [showOtpFlow, setShowOtpFlow] = useState(false);

  const remainingSec = stepUpValid ? getStepUpRemainingSeconds() : 0;
  const remainingMin = Math.ceil(remainingSec / 60);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="px-6 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center sticky top-0 bg-white z-10">
        <button
          onClick={() => customerNavigate('/wallet')}
          className="p-2 -ml-2 text-kkookk-steel hover:text-kkookk-navy"
          aria-label="뒤로 가기"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg ml-2 text-kkookk-navy">설정</h1>
      </div>

      {/* 설정 목록 */}
      <div className="border-t border-slate-100">
        {/* 본인 인증 */}
        <div className="p-4 border-b border-slate-50">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => !stepUpValid && setShowOtpFlow(!showOtpFlow)}
            role={stepUpValid ? undefined : 'button'}
            tabIndex={stepUpValid ? undefined : 0}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className={stepUpValid ? 'text-green-500' : 'text-kkookk-steel'} />
              <span className="text-kkookk-navy font-medium">본인 인증</span>
            </div>
            {stepUpValid ? (
              <div className="flex items-center gap-1.5 text-green-600">
                <Clock size={14} />
                <span className="text-xs font-medium">{remainingMin}분 남음</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-kkookk-orange-500 bg-kkookk-orange-50 px-3 py-1 rounded-full">
                인증하기
              </span>
            )}
          </div>

          {/* 인라인 OTP 플로우 */}
          {showOtpFlow && !stepUpValid && (
            <div className="mt-4 pt-4 border-t border-slate-50">
              <StepUpVerify
                onVerified={() => {
                  setStepUpValid(true);
                  setShowOtpFlow(false);
                }}
              />
            </div>
          )}
        </div>

        {/* 알림 설정 (비활성) */}
        <div className="p-4 border-b border-slate-50 flex justify-between items-center opacity-40 cursor-not-allowed">
          <span className="text-kkookk-navy font-medium">알림 설정</span>
          <div className="w-10 h-6 bg-slate-300 rounded-full relative">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>

        <div className="p-4 border-b border-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-50">
          <span className="text-kkookk-navy font-medium">개인정보 처리방침</span>
          <ChevronRight size={16} className="text-kkookk-steel" />
        </div>
        <div className="p-4 flex justify-between items-center">
          <span className="text-kkookk-navy font-medium">버전 정보</span>
          <span className="text-kkookk-steel text-sm">v1.0.0</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerSettingsPage;
