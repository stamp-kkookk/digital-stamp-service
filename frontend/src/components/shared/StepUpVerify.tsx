/**
 * StepUpVerify 컴포넌트
 * 인라인 OTP 인증 플로우 (StepUp 토큰 획득)
 */

import { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOtpRequest, useOtpVerify } from '@/features/auth/hooks/useAuth';
import { getUserInfo } from '@/lib/api/tokenManager';

interface StepUpVerifyProps {
  onVerified: () => void;
}

export function StepUpVerify({ onVerified }: StepUpVerifyProps) {
  const userInfo = getUserInfo();
  const savedPhone = userInfo?.phone ?? '';

  const [step, setStep] = useState<'idle' | 'otp'>('idle');
  const [phone, setPhone] = useState(savedPhone);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const otpRequest = useOtpRequest();
  const otpVerify = useOtpVerify();

  const handleRequestOtp = () => {
    if (!phone.trim()) return;
    setError(null);

    otpRequest.mutate(
      { phone },
      {
        onSuccess: (res) => {
          setStep('otp');
          if (res.devOtpCode) setOtp(res.devOtpCode);
        },
        onError: () => {
          setError('1분 후 다시 시도해주세요.');
        },
      }
    );
  };

  const handleVerify = () => {
    if (!otp.trim()) return;
    setError(null);

    otpVerify.mutate(
      { phone, code: otp },
      {
        onSuccess: (res) => {
          if (res.verified) {
            onVerified();
          } else {
            setError('인증번호가 올바르지 않습니다.');
          }
        },
        onError: () => {
          setError('인증번호가 올바르지 않습니다.');
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Lock size={28} className="text-kkookk-steel opacity-40" />
      </div>
      <p className="font-bold text-kkookk-navy mb-1">본인 인증이 필요합니다</p>
      <p className="text-sm text-kkookk-steel mb-6">
        휴대폰 번호로 본인 인증을 완료해주세요.
      </p>

      {step === 'idle' ? (
        <div className="w-full max-w-xs space-y-3">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            autoComplete="tel"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleRequestOtp}
            variant="primary"
            size="full"
            disabled={!phone.trim() || otpRequest.isPending}
            isLoading={otpRequest.isPending}
          >
            <ShieldCheck size={18} />
            인증번호 받기
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-3">
          <Input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="인증번호 6자리"
            className="font-mono text-center tracking-widest"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleVerify}
            variant="primary"
            size="full"
            disabled={otp.trim().length !== 6 || otpVerify.isPending}
            isLoading={otpVerify.isPending}
          >
            인증하기
          </Button>
          <button
            onClick={() => {
              setStep('idle');
              setOtp('');
              setError(null);
            }}
            className="text-sm text-kkookk-steel underline underline-offset-4"
          >
            다시 받기
          </button>
        </div>
      )}
    </div>
  );
}

export default StepUpVerify;
